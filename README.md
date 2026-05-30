# GeneFlow Research Dashboard

**GeneFlow** is a modern, real-time, dark-terminal research dashboard that simulates and visualizes a Genetic Algorithm (GA) designed to optimize theoretical propulsion parameters. It features a brutalist, science-fiction aesthetic tailored for aerospace and computational biology aesthetics. 

The dashboard runs a true Genetic Algorithm in your browser (not mocked), executing generations of chromosomes through fitness evaluations, crossover, and mutation, while rendering live analytical charts and simulated hardware metrics.

## Features

- **Live Genetic Algorithm Engine**: Fully functional in-browser GA computing fitness, tournament selection, uniform crossover, and Gaussian mutation.
- **Dual AI Integration Engine**: 
  - Supports the **Groq API** (Llama 3.3 70B) for real-time analysis, insights, and a final research report.
  - Fallback **Rule-Based Engine** intelligently parses GA states to generate coherent technical analysis without needing an API key.
- **System Hardware Monitor**: Dynamically simulates internal metrics like CPU Temperature, Clock Speed (MHz), Power Draw (W), and live VRAM usage based on the actual JavaScript execution time (`performance.now()`) per generation.
- **Live Chromosome Visualizer**: A 7-bar chart updating the best-fit chromosome parameter values in real-time.
- **Data Export**: Generates and downloads a comprehensive JSON payload of the optimization session upon conclusion.

## Theoretical Background

GeneFlow attempts to optimize 7 continuous parameters (ranging from 0.0 to 1.0) for a hypothetical "GeneFlow" propulsion system:
1. `thrustVector`: Primary forward momentum scale.
2. `massRatio`: Efficiency peaks around the golden ratio ($0.618$).
3. `fieldPolarity`: Electromagnetic resonance scaling factor.
4. `resonanceFreq`: Frequency alignment for field coupling.
5. `coilDensity`: Mass/induction ratio.
6. `energyInputKW`: Total power consumption (penalized at extremes).
7. `wavePhaseDeg`: Rotational phase alignment.

### Fitness Function
The algorithm evaluates these parameters by prioritizing a combination of thrust efficiency, electromagnetic resonance coupling, and mechanical-wave alignment, applying harsh penalties for unbounded energy usage. The simulation targets a fitness score of > 0.97.

## Setup & Installation

This project is built using React and Vite.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/GeneFlow.git
   cd GeneFlow
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```

## Usage

1. (Optional) Paste a **Groq API Key** in the top bar to enable live LLM integration. If omitted, the app will run cleanly in DEMO (rule-based) mode.
2. Tweak the GA **Configuration Sliders**: Population Size, Mutation Rate, Crossover Rate, Elitism, and Max Generations.
3. Click **RUN** to start the optimization simulation.
4. Use the **Terminal** at the bottom to ask the AI questions about the current generation state.
5. When the simulation concludes, click **REPORT** to view and export the final academic report.

## Tech Stack
- **React.js** (Hooks, State Management)
- **Vite** (Build Tool)
- **Chart.js** (Live Charting via CDN)
- **Groq API** (LLM Integration)
- **Pure CSS** (Brutalist styling, grid layout, animations)

## License
MIT License. Feel free to fork, experiment, and expand on the genetic algorithm!
