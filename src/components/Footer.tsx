import { Link } from "react-router-dom";
import { Store, Facebook, Twitter, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-muted/30 border-t backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:shadow-lg transition-shadow">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                ShopHub
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your one-stop destination for premium tech and lifestyle products. Quality meets innovation.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                                    Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-muted-foreground hover:text-primary transition-colors">
                                    Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-semibold mb-4">Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link to="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                                    Returns
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold mb-4">Contact</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>123 Commerce St, Tech City</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4 text-primary" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="h-4 w-4 text-primary" />
                                <span>support@shophub.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} ShopHub. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="p-2 rounded-full bg-background border hover:bg-muted transition-colors">
                            <Facebook className="h-4 w-4 text-muted-foreground" />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-background border hover:bg-muted transition-colors">
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-background border hover:bg-muted transition-colors">
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
