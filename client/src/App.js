import React from "react";
import logo from "./logo.svg";
import "./App.css";
import AppList from "./components/AppListComponent";

function App() {
  const [loading, setLoading] = React.useState(true);
  const [appData, setAppData] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    fetch("/api/apps")
      .then((res) => res.json())
      .then((data) => {
        setAppData(data);
        console.log(appData);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        console.log(loading);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <AppList apps={appData} />
    </div>
  );
}

export default App;
