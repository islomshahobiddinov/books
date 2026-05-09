import { useMemo, useState } from 'react'
import './App.css'

type Book = {
  id: string
  title: string
  url: string
  fileName: string
}

const bookModules = import.meta.glob(['./books/*.pdf', '../book/*.pdf'], {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const makeTitle = (path: string) => {
  const fileName = path.split('/').pop() ?? path
  return decodeURIComponent(fileName)
    .replace(/\.pdf$/i, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const books: Book[] = Object.entries(bookModules)
  .map(([path, url]) => ({
    id: path,
    title: makeTitle(path),
    url,
    fileName: decodeURIComponent(path.split('/').pop() ?? 'book.pdf'),
  }))
  .sort((a, b) => a.title.localeCompare(b.title))

function App() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(books[0]?.id ?? '')

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return books
    }

    return books.filter((book) =>
      book.title.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  const selectedBook =
    books.find((book) => book.id === selectedId) ?? filteredBooks[0] ?? books[0]

  return (
    <main className="library-shell">
      <section className="hero-panel" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Online kutubxona</p>
          <h1 id="page-title">Kitoblar sayti</h1>
          <p className="hero-copy">
            PDF kitoblarni bitta joyda saqlang, qidiring va brauzerning o'zida
            o'qing.
          </p>
        </div>

        <div className="stats" aria-label="Kutubxona statistikasi">
          <span>{books.length}</span>
          <small>PDF kitob</small>
        </div>
      </section>

      <section className="content-grid" aria-label="Kitoblar">
        <aside className="book-list-panel">
          <div className="toolbar">
            <label htmlFor="book-search">Kitob qidirish</label>
            <input
              id="book-search"
              type="search"
              placeholder="Nomi bo'yicha qidiring"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="book-list">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <button
                  className={
                    book.id === selectedBook?.id ? 'book-card active' : 'book-card'
                  }
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedId(book.id)}
                >
                  <span className="book-cover" aria-hidden="true">
                    PDF
                  </span>
                  <span>
                    <strong>{book.title}</strong>
                    <small>{book.fileName}</small>
                  </span>
                </button>
              ))
            ) : (
              <p className="empty-state">Bunday nomdagi kitob topilmadi.</p>
            )}
          </div>
        </aside>

        <section className="reader-panel" aria-label="PDF o'quvchi">
          {selectedBook ? (
            <>
              <div className="reader-header">
                <div>
                  <p className="eyebrow">Tanlangan kitob</p>
                  <h2>{selectedBook.title}</h2>
                </div>

                <div className="reader-actions">
                  <a href={selectedBook.url} target="_blank" rel="noreferrer">
                    Ochish
                  </a>
                  <a href={selectedBook.url} download={selectedBook.fileName}>
                    Yuklab olish
                  </a>
                </div>
              </div>

              <iframe
                className="pdf-viewer"
                src={selectedBook.url}
                title={selectedBook.title}
              />
            </>
          ) : (
            <div className="empty-reader">
              <h2>Hali PDF yo'q</h2>
              <p>PDF fayllarni `src/books` papkasiga joylang.</p>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
