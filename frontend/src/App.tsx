import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Sender } from "./components/Sender";
import { Receiver } from "./components/Receiver";

const App = () => {
  return (
    <>
      <div>WebRTC Implementation</div>
      <BrowserRouter>
        <Routes>
          <Route path="/sender" element={<Sender />} />
          <Route path="/receiver" element={<Receiver />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
