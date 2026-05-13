import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/lib/auth"
import { WhatsAppButton } from "@/components/layout/WhatsAppButton"
import { ChatBot } from "@/components/layout/ChatBot"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Home } from "@/pages/Home"
import { ProductDetail } from "@/pages/ProductDetail"
import { CategoryPage } from "@/pages/CategoryPage"
import { CategoriesPage } from "@/pages/CategoriesPage"
import { SearchPage } from "@/pages/SearchPage"
import { AccountPage } from "@/pages/AccountPage"
import { OrdersPage } from "@/pages/OrdersPage"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/categoria/:category" element={<CategoryPage />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/buscar" element={<SearchPage />} />
            <Route path="/cuenta" element={<AccountPage />} />
            <Route path="/pedidos" element={<OrdersPage />} />
          </Routes>
          <ChatBot />
          <WhatsAppButton />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
