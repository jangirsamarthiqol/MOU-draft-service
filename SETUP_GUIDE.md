# Setup Guide for MOU Draft Services

## 1. Google Cloud Setup (Required for Backend)

To save user data to Google Sheets, you need to set up a Service Account.

### Steps:
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new Project (or select an existing one).
3.  Navigate to **APIs & Services > Library**.
4.  Search for **"Google Sheets API"** and click **Enable**.
5.  Navigate to **APIs & Services > Credentials**.
6.  Click **Create Credentials** -> **Service Account**.
7.  Fill in a name (e.g., "mou-writer") and click **Create and Continue**.
8.  (Optional) Skip role assignment. Click **Done**.
9.  Click on the newly created Service Account email (e.g., `mou-writer@project-id.iam.gserviceaccount.com`).
10. Go to the **Keys** tab -> **Add Key** -> **Create new key** -> **JSON**.
11. A file will download. Open it with a text editor.
12. **Copy** the `client_email` and `private_key` values.

## 2. Google Sheet Setup

1.  Create a new Google Sheet at [sheets.google.com](https://sheets.google.com).
2.  Name it "MOU Draft Users".
3.  Add headers in the first row: `Date`, `Name`, `Phone`, `Email`, `Role`.
4.  Copy the **Spreadsheet ID** from the URL.
    - URL format: `d/SPREADSHEET_ID/edit`
5.  **Share the Sheet**: Click the "Share" button and invite the **Service Account Email** (from step 1.9) as an **Editor**.

## 3. Project Configuration

1.  Create a `.env` file in the `server/` directory:
    ```env
    PORT=3000
    SPREADSHEET_ID=your_spreadsheet_id_here
    GOOGLE_CLIENT_EMAIL=your_service_account_email
    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here...\n-----END PRIVATE KEY-----\n"
    ```
    > **Note**: Ensure the private key is enclosed in quotes. If copying from the JSON file, it will already have `\n` characters for newlines, which is correct.

## 4. Running the Project

1.  **Install Dependencies**:
    ```bash
    npm run install:all
    ```

2.  **Start Application**:
    ```bash
    npm run dev
    ```
    (This starts both the React Frontend and Node Backend)

3.  Open the URL shown in the terminal (usually `http://localhost:5173`).
