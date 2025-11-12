import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/cache';
import fs from 'fs/promises';
import path from 'path';


const DATA_DIR = path.join(process.cwd(), 'data');
const PROFILE_FILE = path.join(DATA_DIR, 'profiles.json');

async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (e) {
        // ignore
    }
}

async function readProfilesFile(): Promise<Record<string, any>> {
    try {
        const raw = await fs.readFile(PROFILE_FILE, 'utf8');
        return JSON.parse(raw || '{}');
    } catch (e) {
        return {};
    }
}

async function writeProfilesFile(obj: Record<string, any>) {
    await ensureDataDir();
    await fs.writeFile(PROFILE_FILE, JSON.stringify(obj, null, 2), 'utf8');
}

async function getUserLogin(accessToken: string) {
    const res = await axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } });
    return res.data.login;
}

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) return new Response('Unauthorized', { status: 401 });
    const _start = Date.now();
    try {
        const login = await getUserLogin(accessToken);
        // Check cache first
        const key = `profile:${login}`;
        const cached = cacheGet(key);
        if (cached) return NextResponse.json(cached);

        // Fallback to file storage
        const profiles = await readProfilesFile();
        const profile = profiles[login];
        if (!profile) return new Response('Not found', { status: 404 });
        // warm cache
        cacheSet(key, profile, 1000 * 60 * 60 * 24 * 7);
        return NextResponse.json(profile);
    } catch (e) {
        console.error('Failed to GET profile', e);
        return new Response('Error', { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) return new Response('Unauthorized', { status: 401 });
    const _start = Date.now();
    try {
        const login = await getUserLogin(accessToken);
        const body = await request.json();

        // persist to file-backed store
        const profiles = await readProfilesFile();
        profiles[login] = body;
        await writeProfilesFile(profiles);

        // also cache
        const key = `profile:${login}`;
        cacheSet(key, body, 1000 * 60 * 60 * 24 * 7);
        return NextResponse.json({ ok: true, profile: body });
    } catch (e) {
        console.error('Failed to POST profile', e);
        return new Response('Error', { status: 500 });
    }
}
