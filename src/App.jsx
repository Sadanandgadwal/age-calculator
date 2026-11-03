import { createElement } from 'react';
import { Route, Routes } from 'react-router';
import AppLayout from './components/layout/AppLayout.jsx';
import { CATEGORIES } from './data/toolCategories.js';
import { getToolPage } from './data/toolPages.js';
import { TOOLS } from './data/toolsRegistry.js';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import HomePage from './pages/HomePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ToolDirectoryPage from './pages/ToolDirectoryPage.jsx';

/** All routes. Category and tool routes come from their registries. */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="all-tools" element={<ToolDirectoryPage />} />
        {CATEGORIES.map((category) => (
          <Route key={category.id} path={category.route} element={<ToolDirectoryPage category={category} />} />
        ))}
        {TOOLS.map((tool) => (
          <Route key={tool.id} path={tool.route} element={createElement(getToolPage(tool))} />
        ))}
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
