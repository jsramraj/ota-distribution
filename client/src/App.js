import React from "react";
import logo from "./logo.svg";
import "./App.css";
import AppList from "./components/AppListComponent";
import AppDetailComponent from "./components/AppDetailComponent";
import {
  BrowserRouter,
  Routes,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/apps" element={<AppList />}></Route>
          <Route path="/apps/:id" element={<AppDetailComponent />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
