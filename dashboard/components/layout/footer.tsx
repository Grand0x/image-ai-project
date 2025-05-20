export default function Footer() {
  return (
    <footer className="border-t border-primary py-4 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Image AI Dashboard. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
