import React from "react";
import logo from "./logo.svg";
import "./App.css";
import AppList from "./components/AppListComponent";
import AppDetailComponent from "./components/AppDetailComponent";
import AppUploadComponent from "./components/AppUploadComponent";

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
          <Route path="/apps/upload" element={<AppUploadComponent />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
