# CartShare – Collaborative Shopping Ecosystem

CartShare is a responsive group-shopping web application. Users can create a room, share its six-character code, add items to a shared cart, view activity, track a delivery target, and print a group receipt.

## Features
- Name-based entry screen
- Create a unique six-character room code or join an existing room
- Add and remove cart items with price and quantity
- Automatic cart total and item count
- Delivery threshold progress indicator (default ₹5,000)
- Activity log showing who performed each action
- Room member list
- LocalStorage persistence and automatic restore after refresh
- Storage event synchronization across tabs in the same browser profile
- Printable receipt with item, quantity, unit price, contributor and total
- Responsive layout using Bootstrap 5, CSS Flexbox and Grid

## Folder structure
```text
CartShare/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   └── app.js
└── assets/
```

## Run locally
1. Extract the CartShare project folder.
2. Open the folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code Live Server extension.
4. Enter your name and create a room.
5. Copy the room code. Open another tab in the same browser profile, open the same project, enter another name and join using that code.
6. Add or remove items in either tab. The other tab should update automatically.

## Important collaboration limitation
This course implementation uses browser LocalStorage and the `storage` event, as specified in the brief. It synchronizes tabs that share the same browser storage on the same device/browser profile. It does **not** provide true internet-based synchronization between different devices or unrelated browser profiles. For production multi-device collaboration, connect a backend such as Firebase Firestore or Supabase Realtime and add proper authentication and server-side validation.

## Customize
- Change `DELIVERY_TARGET` near the top of `js/app.js` to change the free-delivery target.
- Currency is currently INR (`₹`) in `js/app.js`.
- Update the project title, colors and text in `index.html` and `css/style.css`.

## Deploy
### GitHub
1. Create a GitHub repository named `CartShare`.
2. Upload the contents of this folder (not the ZIP file) to the repository.
3. Ensure `index.html`, `css/`, `js/`, `assets/` and `README.md` are at the repository root.
4. Copy the repository URL for submission.

### Netlify
1. Sign in to Netlify and choose **Add new site → Import an existing project**.
2. Connect GitHub and select the CartShare repository.
3. For this static project, leave the build command blank and set the publish directory to `.` (the repository root).
4. Deploy the site and open the generated URL to test it.

## Submission naming
Use the course format: `BatchID_FullName_CartShare` when submitting your links through the portal. Replace the placeholders with your actual batch ID and full name.
