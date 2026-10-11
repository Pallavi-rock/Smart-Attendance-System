# React + TypeScript + Vite

## Secure admin setup

Public registration creates student profiles only. Admin profiles are never created by the React client and there is no public admin registration route.

### One-time bootstrap

Run the bootstrap command from a trusted operator environment with Firebase Admin SDK Application Default Credentials configured. The command refuses to run when any active admin already exists:

```sh
cd functions
npm install
npm run bootstrap
```

It prompts for the initial administrator name, email, and temporary password. Do not put these values in React code, `VITE_` variables, source control, or a service-account file under `client/`. Change the temporary password after the first login.

### Admin management

After bootstrap, an active admin can use `/admin/users/admins` to create another admin or activate/deactivate an existing one. Creation and status changes go through callable Cloud Functions, which verify the caller's active admin profile and write the protected profile and audit log with the Admin SDK. The new account receives a Firebase password setup email; no password is returned to the browser.

Deploy the backend and rules from a trusted environment after reviewing the Firebase project selected by `.firebaserc`:

```sh
firebase deploy --only functions,firestore:rules
```

The Functions runtime uses Node 20 and the configured `asia-south1` region. Credentials and deployment access are intentionally not included in this repository.

### Security model

Firestore rules permit public self-registration only for active student profiles. Client writes cannot change `role` or `status`; admin creation, activation, deactivation, and audit writes are server-only. The backend refuses to deactivate the last active administrator and inactive profiles cannot use role-protected application data.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
