export function Footer() {
  return (
    <footer id="footer" className="mt-16 border-t border-border/20 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="group flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary to-amber-400 shadow-md shadow-primary/25">
                <span className="text-xs font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-heading text-lg font-semibold tracking-wide text-foreground">Market</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Tu tienda de tecnología de confianza.
            </p>
          </div>

          {[
            { title: "Productos", links: ["Electrónica", "Oficina", "Accesorios", "Ofertas"] },
            { title: "Soporte", links: ["Contacto", "Envíos", "Devoluciones", "FAQ"] },
            { title: "Legal", links: ["Términos", "Privacidad", "Cookies"] },
          ].map((section) => (
            <div key={section.title}>
              <h4 className="font-heading mb-3 text-base font-semibold text-foreground">{section.title}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors duration-200 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border/20 pt-6 text-center text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} Market. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
