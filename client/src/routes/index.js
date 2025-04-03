import config from '~/config';

//layouts
import { DefaultLayout, HeaderOnly } from '~/components/Layout';
import AdminLayout from '~/components/Layout/AdminLayout/AdminLayout';
import Home from '~/pages/Home';
import Profile from '~/pages/Profile';
import ProductItem from '~/pages/ProductItem/ProductItem';
import Login from '~/pages/Login';
import Register from '~/pages/Resgister';
import CustomerManagement from '~/pages/CustomerManagement';
import ProductManagement from '~/pages/ProductManagement';
import OrderManagement from '~/pages/OrderManagement/OrderManagement';
import Report from '~/pages/Report/Report';
import VoucherManagement from '~/pages/voucherManagement';
import Categorymanagement from '~/pages/Categorymanagement';
import BrandManagement from '~/pages/BrandManagement';
import Product from '~/pages/Product';
import Cart from '~/pages/Cart';
import ForgotPass from '~/pages/ForgotPass';
import Payment from '~/pages/Payment';
import Order from '~/pages/Order';
import Shipping from '~/pages/Shipping';

//public Routes
const publicRoutes = [
  { path: config.routes.home, component: Home, layout: HeaderOnly },
  { path: config.routes.product, component: Product, layout: HeaderOnly },
  { path: config.routes.profile, component: Profile, layout: HeaderOnly },
  { path: config.routes.cart, component: Cart, layout: HeaderOnly },
  { path: config.routes.payment, component: Payment, layout: HeaderOnly },
  { path: config.routes.order, component: Order, layout: HeaderOnly },
  { path: config.routes.shipping, component: Shipping, layout: HeaderOnly },
  { path: `${config.routes.productItem}/:id`, component: ProductItem, layout: HeaderOnly },
  { path: config.routes.login, component: Login, layout: DefaultLayout },
  { path: config.routes.forgotpass, component: ForgotPass, layout: DefaultLayout },
  { path: config.routes.register, component: Register, layout: DefaultLayout },
  { path: config.routes.customermanagement, component: CustomerManagement, layout: AdminLayout },
  { path: config.routes.productmanagement, component: ProductManagement, layout: AdminLayout },
  { path: config.routes.categorymanagement, component: Categorymanagement, layout: AdminLayout },
  { path: config.routes.brandmanagement, component: BrandManagement, layout: AdminLayout },
  { path: config.routes.ordermanagement, component: OrderManagement, layout: AdminLayout },
  { path: config.routes.vouchermanagement, component: VoucherManagement, layout: AdminLayout },
  { path: config.routes.report, component: Report, layout: AdminLayout },
];

//private routes
const privateRoutes = [];

export { publicRoutes, privateRoutes };
