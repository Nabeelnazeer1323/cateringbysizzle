import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, ShoppingCart, Settings, PackageSearch } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cartItems
  } = useCart();
  const {
    user,
    signOut
  } = useAuth();
  const isLoggedIn = !!user;
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate("/");
  };
  return <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl md:text-2xl text-orange-600 font-extrabold text-center">
                Sizzle
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? <>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link to="/order">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          Order
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="flex items-center gap-2">
                        <User className="h-4 w-4 text-orange-600" />
                        My Account
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="w-[200px] p-3 space-y-2">
                          <li>
                            <Link to="/profile" className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded-md">
                              <User className="h-4 w-4 text-orange-600" />
                              My Profile
                            </Link>
                          </li>
                          <li>
                            <Link to="/order-history" className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded-md">
                              <PackageSearch className="h-4 w-4 text-orange-600" />
                              Order History
                            </Link>
                          </li>
                          <li>
                            <Link to="/company-settings" className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded-md">
                              <Settings className="h-4 w-4 text-orange-600" />
                              Company Settings
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Link to="/contact">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          About & Contact
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <div className="ml-4 flex items-center">
                  <Link to="/cart">
                    <Button variant="ghost" className="flex items-center gap-2 mr-4 relative">
                      <ShoppingCart className="h-4 w-4 text-orange-600" />
                      Cart
                      {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="flex items-center gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 text-orange-600" />
                    Log out
                  </Button>
                </div>
              </> : <>
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link to="/contact">
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                          About & Contact
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <div className="ml-4 flex items-center">
                  <Link to="/login">
                    <Button variant="outline" className="mr-2">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="text-white bg-orange-600 hover:bg-orange-500">
                      Register
                    </Button>
                  </Link>
                </div>
              </>}
          </div>

          <div className="md:hidden flex items-center">
            {isLoggedIn && <Link to="/cart" className="mr-4 relative">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
                {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>}
              </Link>}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <Menu className="block h-6 w-6 text-orange-600" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && <div className="md:hidden bg-white shadow-lg rounded-b-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isLoggedIn && <>
                <Link to="/order" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50">
                  Order
                </Link>
                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50">
                  My Profile
                </Link>
                <Link to="/order-history" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50">
                  Order History
                </Link>
                <Link to="/company-settings" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50">
                  Company Settings
                </Link>
                <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50">
                  About & Contact
                </Link>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <button className="block w-full px-3 py-2 rounded-md text-center text-base font-medium text-gray-700 hover:bg-orange-50" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </>}
            {!isLoggedIn && <>
                <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>
                  About & Contact
                </Link>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-5">
                    <Link to="/login" className="block w-full px-3 py-2 rounded-md text-center text-base font-medium text-orange-600 border border-orange-600" onClick={() => setIsMenuOpen(false)}>
                      Log in
                    </Link>
                  </div>
                  <div className="mt-3 px-5">
                    <Link to="/register" className="block w-full px-3 py-2 rounded-md text-center text-base font-medium text-white bg-orange-600" onClick={() => setIsMenuOpen(false)}>
                      Register
                    </Link>
                  </div>
                </div>
              </>}
          </div>
        </div>}
    </nav>;
};
export default Navbar;