# React Template

This template is built on top of [React + Vite](https://vitejs.dev/) by Miracle Innovation Labs⚡ at [Miracle Software Systems](https://miraclesoft.com/)

## This Template Comes With

**Tailwind CSS:** Tailwind CSS is a utility-first CSS framework for rapidly building modern websites without ever leaving your HTML

**ShadCn:** Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source 

We recommend using shadcn-ui instead of traditional component libraries

# Folder Structure and Naming Conventions
### Folder Structure

    .
    ├── public                # This directory contains static assets that are served as-is by your web server
    ├── src                   # This directory contains your application's source code.
    │   ├── assets            # This directory contains static assets that are imported into your JavaScript/JSX files
    │   ├── components        # Contains reusable React components.
    │   ├── layout            # Layout of our application.
    │   ├── lib               # This directory may contain utility functions, helper classes, or any other JavaScript modules
    │   ├── screens           # These screens represent the different user interfaces that users interact with as they navigate
    │   ├── services          # Contains modules responsible for handling interactions with external services, such as APIs.
    │   ├── App.jsx           # Development starts here.
    │   ├── global.css        # Contains Tailwind and shadCn css configuration.
    │   ├── index.css         # Default CSS.
    │   └── main.jsx          # This is the entry point JavaScript/JSX file where your React application starts.
    ├── .env.example          # Contains only keys referring to actual environment variables
    ├── .eslint.cjs           # eslint config
    ├── .gitignore            # gitignore config
    ├── components.json       # Shadcn configurations
    ├── index.html            # Base HTML file
    ├── jsconfig.json         # jsconfig for alias imports
    ├── package.json          # Package.json file
    ├── postcss.config.js     # PostCSS configuration
    ├── README.md             # This file typically contains information about your project
    ├── tailwind.config.js    # Tailwind CSS
    └── vite.config.js        # Vite config file

- In public folder we have Innovation labs(❤️) logos 
- Feel free to edit favicon and title from index.html

# Naming Conventions
1. **Components**:
   - Use PascalCase for naming components. For example: `Header`, `Button`, `LoginForm`.
   - Component filenames should match the component name. For example, a component named `Header` should be defined in a file named `Header.js`.

2. **Props**:
   - Use camelCase for prop names. For example: `<Button buttonText="Click me" />`.
   - Prop names should be descriptive and indicative of the data or behavior they represent.

3. **State**:
   - Use camelCase for state variables. For example: `const [count, setCount] = useState(0);`.

4. **Events**:
   - Use camelCase for event handler names. For example: `onClick`, `onChange`.

5. **CSS Classes**:
   - Use kebab-case for naming CSS classes. For example: `.button-primary`, `.header-container`.

6. **Files and Folders**:
   - Use kebab-case for naming files and folders. For example: `user-profile`, `utils`.

7. **Constants and Environment Variables**:
   - Use SCREAMING_SNAKE_CASE for naming constants. For example: `MAX_LENGTH`, `API_URL`.

8. **Hooks**:
   - Custom hooks should start with `use`. For example: `useLocalStorage`, `useTheme`.

9. **Routes**:
   - Use PascalCase for naming route components. For example: `Home`, `About`, `Dashboard`.

10. **Comments**:
    - Write clear and concise comments to explain complex logic or functionality.
# Colors and Font

## colors
In this template, we have configured [Miracle standard colors](https://me.miraclesoft.com/home/corporate-standards). You can use them like regular Tailwind classes. For example: `text-miracle-lightBlue`, `bg-miracle-black`.

```js
miracle: {
    lightBlue: '#00aae7',
    mediumBlue: '#2368a0',
    darkBlue: '#0d416b',
    red: '#ef4048',
    black: '#232527',
    white: '#ffffff',
    darkGrey: '#8c8c8c',
    lightGrey: '#b7b2b3'
}
```
## Font
Comes with Montserrat as default font can be changed in index.css

# Environment Variables

Going forward you need to update .env.example file with your env file for reference purpose in .env.example only keep keys
```
ENV :
SERVER_URL :
CLIENT_KEY :
```

## Usage

Create a template using the following command and select react 

```bash
  npm create @miraclesoft/project
  ?select template
  > react
    
  Enter your project name >> my-awesome-project
```
After creating project follow instruction on console

## Acknowledgements

-  [![vite](https://img.shields.io/badge/vite-js-white?logo=vite)](https://vitejs.dev/)
-  [![TailwindCSS](https://img.shields.io/badge/tailwind-css-grey?logo=tailwindcss)](https://tailwindcss.com/)
-  [![shadcn](https://img.shields.io/badge/shadcn-ui-black?logo=shadcnui)](https://ui.shadcn.com/)


## Authors

- [@saibendalam](https://www.github.com/saibendalam)

