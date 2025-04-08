//the rong dung de chua layout rieng
import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes } from '~/routes';
import DefaultLayout from '~/components/Layout/DefaultLayout/DefaultLayout';
import { CartProvider } from './pages/Cart/CartProvider';
import { FilterProvider } from './components/Layout/components/Header/FilterContext';

function App() {
  return (
    <Router>
      <div className="App">
        <CartProvider>
          <FilterProvider>
            <Routes>
              {publicRoutes.map((route, index) => {
                const Page = route.component;

                let Layout = DefaultLayout;
                // neu co layout
                if (route.layout) {
                  Layout = route.layout;
                  //ko co layout
                } else if (route.layout === null) {
                  Layout = Fragment;
                }

                return (
                  <Route
                    key={index}
                    path={route.path}
                    element={
                      <Layout>
                        <Page />
                      </Layout>
                    }
                  />
                );
              })}
            </Routes>
          </FilterProvider>
        </CartProvider>
      </div>
    </Router>
  );
}

export default App;
