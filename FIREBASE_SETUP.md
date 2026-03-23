# Firebase Setup

## 1. Create Firestore Database

In Firebase Console:

1. Open project `react-project-a6f46`
2. Go to `Firestore Database`
3. Click `Create database`
4. Start in `Production mode`
5. Choose a region close to you

## 2. Apply Firestore Rules

Open `Firestore Database -> Rules` and replace the current rules with the contents of:

- `firestore.rules`

Then click `Publish`.

## 3. Optional: Deploy With Firebase CLI

If Firebase CLI is installed and you are logged in:

```bash
firebase deploy --only firestore:rules
```

## 4. Sign In

Use one of the admin emails allowed in rules:

- `paradoxakka@gmail.com`
- `paradox.akka@bpc.kg`
- `kasiet.moldalieva@bpc.kg`

## 5. Seed Base Collections

In the app:

1. Sign in
2. Open `Admin -> Integrations`
3. Click `Seed Firestore base`

This will populate:

- `employees`
- `departments`
- `roles`
- `request_types`
- `workflows`
- `documents`

## 6. Why The Error Happened

`Missing or insufficient permissions` appears when:

- Firestore database is not created yet
- Firestore rules do not allow the operation
- The signed-in user is not allowed to write the target collection
