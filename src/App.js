import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import routes from './routes';
import './App.css';

// App Router component that renders routes
const AppRouter = () => {
  return (
    <Routes>
      {routes.map((route, i) => {
        if (route.children) {
          return (
            <Route key={i} path={route.path} element={route.element}>
              {route.children.map((childRoute, j) => (
                <Route key={j} path={childRoute.path} element={childRoute.element} />
              ))}
            </Route>
          );
        }
        return <Route key={i} path={route.path} element={route.element} />;
      })}
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
