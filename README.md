# Procedural-Mapper

Create a 3D procedural map from minimal user input with this interactive tool. The project uses a heightmap image to generate terrain in a 3D view.

## Installation & Setup

Follow these steps to set up the project:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/Procedural-Mapper.git
    cd Procedural-Mapper
    ```

2. **Install dependencies**:
    To install the required dependencies, run:
    ```bash
    npm install
    ```

## Usage

### Running the Development Server

To start the development server, run the following command in your terminal:

```bash
npm run dev
```

This will launch the application in your default web browser.

### View the 3D Terrain
1. **Save the Heightmap**:
    Use the Save Heightmap button in the UI to generate and save the heightmap image.

2. **Move the Heightmap Image**:
    After saving the heightmap image, manually move it to the public/assets folder in your project directory. This is necessary because the JavaScript code accesses the image from this location.

3. **View the Terrain**:
    Once the image is in the correct folder, click the View in 3D button to load the heightmap and generate the 3D terrain view.

### Folder Structure

Ensure the following folder structure:

```bash
/public
  /assets  <-- Place the saved heightmap image here
/src
  /...
```

## Technologies Used

1. npm (for package management)

2. Three.js (for rendering 3D graphics)

3. HTML/CSS (for frontend UI)
