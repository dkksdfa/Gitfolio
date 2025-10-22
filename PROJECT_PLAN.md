# Project Plan: AI Portfolio Builder

## 1. Main Page (Landing Page)

-   **Layout:** Create a standard website landing page with a banner, service description, etc.
-   **Buttons:**
    -   Login Button
    -   "Create Portfolio" Button
-   **Flow:** If a non-logged-in user clicks "Create Portfolio", they are redirected to the login page.

## 2. Portfolio Generation Flow

1.  **Login:** User logs in with their GitHub account.
2.  **Analysis Page:** After login and clicking "Create Portfolio", the user is taken to a page that analyzes their GitHub account.
    -   **UI:** The UI needs some design improvements.
    -   **Displayed Information (for each repository):**
        -   Languages used
        -   Contributor count
        -   Project title
        -   **(New Feature)** A clickable GitHub link for the repository.
        -   Other data currently implemented.
3.  **Template Selection Page:**
    -   After the analysis page, the user proceeds to a page with a list of portfolio templates.
    -   Each template in the list should have a thumbnail and a "Preview" button.
4.  **(Optional Feature) Custom Template Creation:**
    -   Consider adding a feature for users to create a new template using a custom prompt if they don't like the existing ones.
5.  **Final Portfolio Generation:**
    -   The user selects a template and clicks a "Generate Portfolio" button.
    -   A loading indicator is shown.
    -   **Goal:** The final output is a downloadable static portfolio website.
