// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EventPage from "./components/EventPage";
import Confirmation from "./components/Confirmation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EventPage />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>
    </BrowserRouter>
  );
}
