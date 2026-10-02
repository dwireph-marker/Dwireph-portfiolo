import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CharacterModel from "./components/Character";
import MainContainer from "./components/MainContainer";
import AdminPanel from "./components/AdminPanel";
import { LoadingProvider } from "./context/LoadingProvider";
import { CMSProvider } from "./context/CMSContext";

const Portfolio = () => (
  <MainContainer>
    <CharacterModel />
  </MainContainer>
);

const App = () => {
  return (
    <BrowserRouter>
      <CMSProvider>
        <LoadingProvider>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LoadingProvider>
      </CMSProvider>
    </BrowserRouter>
  );
};

export default App;
