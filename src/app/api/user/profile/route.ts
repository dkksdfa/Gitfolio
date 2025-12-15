import { type NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { cacheGet, cacheSet } from '@/lib/cache';
import { db } from '@/lib/firebase';

async function getUserLogin(accessToken: string) {
    const res = await axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } });
    return res.data.login;
}

export async function GET(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value;
    if (!accessToken) return new Response('Unauthorized', { status: 401 });

    try {
        const login = await getUserLogin(accessToken);
        // Check cache first
        const key = `profile:${login}`;
        const cached = cacheGet(key);
        if (cached) return NextResponse.json(cached);

        // Fallback to Firebase Firestore
        if (!db) {
            console.warn('Firebase not initialized');
            return new Response('Database not configured', { status: 404 });
        }

        const doc = await db.collection('profiles').doc(login).get();
        if (!doc.exists) return new Response('Not found', { status: 404 });

        const profile = doc.data();
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

    try {
        const login = await getUserLogin(accessToken);
        const body = await request.json();

        if (!db) {
            console.warn('Firebase not initialized');
            return new Response('Database not configured', { status: 503 });
        }

        // persist to Firestore
        await db.collection('profiles').doc(login).set(body);

        // also cache
        const key = `profile:${login}`;
        cacheSet(key, body, 1000 * 60 * 60 * 24 * 7);
        return NextResponse.json({ ok: true, profile: body });
    } catch (e) {
        console.error('Failed to POST profile', e);
        return new Response('Error', { status: 500 });
    }
}
