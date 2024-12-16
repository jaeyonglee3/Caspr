<div align="center">
  <img alt="Logo" src="https://github.com/user-attachments/assets/2887aa3f-b9c9-4bf9-8e0d-c0633570fe0c">
  <h1>Caspr</h1>
</div>

### The Problem
- Researchers across diverse fields grapple with understanding complex systems comprised of numerous interconnected variables and causal relationships.
- Traditional visualization methods, such as 2D diagrams and static displays, prove inadequate in capturing the intricate interplay of these factors.
- This limitation hinders comprehension of the system's dynamics, restricts exploration and analysis, and impedes effective knowledge sharing and collaboration.

### Our Solution
- Caspr (Causal Analysis and Structure Path Relationships) is a web application that empowers users to explore complex causal diagrams in an intuitive 3D environment.
- By transforming data into interactive visualizations, Caspr reveals intricate relationships between variables in multifaceted systems across diverse research domains, including machine learning, economics, environmental studies, and political science.
- Secure user accounts, graph sharing with permissions, and a dedicated explore page promotes collaboration and knowledge sharing. Simply upload a formatted JSON file to see the data come to life.

### Useful Links
- Try the application at [caspr.vercel.app](https://caspr.vercel.app/)
- See our demo video [here](https://www.youtube.com/watch?v=6aORwIygIAM)
- This readme is geared towards developers and is meant to serve as the project's technical documentation. For user instructions and guidance, see our [Application User Guide](https://docs.google.com/document/d/1PY3aDcpMCG_7qnzSSssFF1nvCmY3Tb28pG5efoUcyBk/edit?usp=sharing)

## Application Preview

<p align="center">
  <img width="49%" alt="image" src="/images/login_page.jpg">
  <img width="49%" alt="image" src="/images/my_graphs_page.jpg">
</p>

<p align="center">
  <img width="49%" alt="image" src="/images/upload_file_page.jpg">
  <img width="49%" alt="image" src="/images/graph_view.jpg">
</p>

## Key Features
- **Our Secure Account System**: Create an account and log in to securely save, manage, and share your graphs. Caspr uses Firebase Authentication to protect your information. Caspr allows login and account creation via Google, convenient password reset, and easy-to-use graph access control with permissions to ensure your data remains private and secure.

- **Dynamic 3D Graph Visualization**: Caspr brings causal diagrams to life! The 3D graph is generated dynamically from JSON data, where each node and edge represents crucial connections between elements. You can explore complex systems with ease.

- **Smooth Graph Interaction**: Navigate the graph in a fully immersive 3D space. Zoom, pan, and rotate the graph freely to explore relationships from every angle. It's simple and intuitive, letting you focus on discovering insights.

- **Node and Edge Information on Hover**: Curious about a specific node or edge? Just hover over it to see all the details, including node labels, categories, and edge relationships and strengths.
<div align="center">
 <img src="/images/connection_description.png" alt="Connection Description" width="40%" height="40%">
   <img src="/images/node_description.png" alt="Node Description" width="40%" height="40%">
 </div>

- **Powerful Filtering and Searching**: Customize your view with filtering based on connection strength, or search for nodes by name, category, or ID. The graph instantly adjusts to show exactly what you need.
<div align="center">
  <img src="/images/search.gif" alt="Node Description" width="60%" height="60%">
</div>

- **Connection Type and Direction Indicators**: Easily differentiate between causal and inhibitory connections using color-coded edges (black for causal, red for inhibitory), and follow the arrows to see the direction of influence between nodes.
<div align="center">
  <img src="/images/filtering_edges.gif" alt="Node Description" width="60%" height="20%">
</div>

- **Graph Uploading and Sharing**: Upload JSON files to create custom causal graphs and choose to share them publicly, keep them private, or share to specific users. Additionally, use the generated public link to easily share your graph. To view graphs shared to you, view the shared with me page in the sidebar.

- **Explore Page**: Browse and explore public graphs created by other users.

<!-- PARTNER INTRO -->
## Project Partner Introduction
- This is an open source project built for the Machine Learning Group in the Department of Computer Science (DCS) at the University of Toronto (UofT).
- DCS has several faculty members working in the area of machine learning, neural networks, statistical pattern recognition, probabilistic planning, and adaptive systems.
    * **Sheldon Huang, Research Lead, Primary Contact**: huang@cs.toronto.edu
    * **Yuchen Wang, Software Lead, Secondary Contact**: https://www.yuchenwyc.com/

<!-- RUNNING THE APPLICATION SECTION -->
## Running the Application

#### The application can be accessed in one of two ways
- **Live Deployment**: Access the live deployment at [caspr.vercel.app](https://caspr.vercel.app/).
- **Local Setup**: Follow the steps below to run the application locally.

#### Requirements for Running Locally
- **Node.js**: Install Node.js from the [official website](https://nodejs.org/en).
- **npm**: Comes with Node.js and is necessary for managing dependencies.
- **Local environment configuration**: See the section below to ensure your local environment is configured properly for development.
  
#### Local Installation Steps
- Clone the repository from the main branch:
  ```bash
  git clone https://github.com/csc301-2024-f/project-19-Machine-Learning-Group.git
  ```
- Navigate to the project directory:
  ```bash
  cd app
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Add the `.env.local` file to the app folder (see the Local Environment Configuration section below)
- Start the development server:
  ```bash
  npm run dev
  ```
- Access the app at [http://localhost:3000/](http://localhost:3000/).

#### Local Environment Configuration
Below is a list of the environment variables used in the project. Add them to a `.env.local` folder inside the `/app` directory. Please reach out to a developer on the team to get the secret variables.

```bash
# Firebase configuration (public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCVpcoqobwcNx37i4UqlvlnQQ5BiihdVU4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=d-causal-visualization.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=d-causal-visualization
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=d-causal-visualization.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=252332401416
NEXT_PUBLIC_FIREBASE_APP_ID=1:252332401416:web:68c696e3d17fc7308f82bd
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-KGPKJWZTD7

# Firebase admin SDK credentials (secret)
NEXT_FIREBASE_CLIENT_EMAIL=credential_here
NEXT_FIREBASE_PRIVATE_KEY=credential_here
NEXT_FIREBASE_DATABASE_URL=credential_here

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000/ 
NEXT_PUBLIC_API_URL=http://localhost:3000/ 

# Firebase collection names
NEXT_FIREBASE_GRAPH_COLLECTION=graph_metadata 
NEXT_FIREBASE_USER_COLLECTION=users 
```


#### Building for Production
To prepare the app for production:
```bash
npm run build
```

#### Testing, Linting, and Formatting
- Run the test suites: `npm test`
- Lint the app: `npm run lint`
- Format with Prettier: `npx prettier --write .`

#### External Dependencies and 3rd Party Software
Our project relies on several external dependencies and third-party libraries to enhance functionality and simplify development. Below is a summary of the key dependencies:
- **Next.js**: The React framework for building server-rendered and static web applications. It provides features like routing, server-side rendering, and static site generation.
  - [Next.js Documentation](https://nextjs.org/docs)
- **React**: A JavaScript library for building user interfaces, used as the core UI framework of the project.
  - [React Documentation](https://react.dev/learn)
- **Three.js**: A powerful JavaScript library for 3D graphics, used to render the 3D causal diagram.
  - [Three.js Documentation](https://threejs.org/docs/)
- **D3.js**: A library for manipulating documents based on data, used to handle graph layouts and positioning nodes in the visualization.
  - [D3.js Documentation](https://d3js.org/getting-started)
- **Chakra UI**: A simple, modular, and accessible component library that provides reusable UI components and styling for our frontend.
  - [Chakra UI Documentation](https://v2.chakra-ui.com/docs/components)
- **npm**: The Node package manager is used to manage the project’s dependencies and run scripts.
  - [npm Documentation](https://docs.npmjs.com/)

## Contributing and Development Requirements
We welcome contributions from the community! Here are some requirements:

1. **Code Formatting**: Ensure the Prettier extension is set up as the formatter in VS Code as all files should adhere to the Prettier confirguration found in this repository.
2. **Commit Standards**: Follow conventional commit standards to ensure clarity and consistency.
3. **Documentation**: Maintain detailed docstrings for all functions and files. Include `@param`, `@returns` entries alongside a description of the component.
4. **Branching Strategy**: Use a branching strategy with a prefix for the category and a name for the exact purpose of the branch. Such as `feature/<name>` or `fix/<name>` or `test/<name>`. Submit pull requests for 2-3 reviews before merging to main.

And Here are some ways in which you can contribute:
1. Reporting Bugs
    * **Check existing issues:** Before reporting a new bug, please check the github issues tab to see if it's already been reported.
    * **Provide details:** When reporting a bug, please include as much detail as possible, including steps to reproduce the issue, expected behavior, 1  actual behavior, and your environment (operating system, browser, etc.).

2. Suggesting Enhancements
    * **Open an issue:**  If you have an idea for a new feature or improvement, please open an issue on the github issues tab with a clear description of your suggestion.
    * **Discuss your idea:**  We encourage you to discuss your proposal with the community before starting any work to ensure it aligns with the project's goals and direction.

3. Submitting Code Changes
    * **Fork the repository:** Fork the project to your own GitHub account.
    * **Create a branch:** Create a new branch for your changes.
    * **Follow coding style:** Adhere to the project's coding style and conventions. Again, all files should be formatted according to the included Prettier configuration file.
    * **Write tests:**  Include tests for your code changes.
    * **Open a pull request:** Submit a pull request with a clear description of your changes.

We appreciate your contributions and look forward to collaborating with you to improve this project!

## Deployment and Workflow
Before code is pushed to the **main** branch, all pull requets must go through a series of verification and validation steps. The workflow proceeds as follows
1. Make the change you'd like to make on your own branch
2. Create a pull request, which developers will review
3. Developers will merge and deploy at their discretion

## Licences
- This project is distributed under the MIT License. See LICENSE.txt for more information. 
- This license was chosen as it is a very permissive open-source license.  Anyone can use, modify, and distribute this project's code for any purpose, as long as they include the original license and copyright notice.
- This gives users and potential open-source developers a lot of freedom while providing minimal restrictions, encouraging wider adoption and collaboration.
