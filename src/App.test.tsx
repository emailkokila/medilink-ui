import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

test("App component renders without crashing", () => {
  // Wrap App in BrowserRouter because App uses react-router-dom hooks/components
  render(<BrowserRouter><App /></BrowserRouter>);
  // We don't check for specific text, we just ensure `render` didn't throw an error.
});