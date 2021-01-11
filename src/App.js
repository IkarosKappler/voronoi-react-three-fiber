import logo from './logo.svg';
import './App.css';
import { MeshDisplay } from './MeshDisplay';

function App() {
  return (
    <div className="App">
	    <MeshDisplay position={[-1.2, 0, 0]} />
    </div>
  );
}

export default App;
