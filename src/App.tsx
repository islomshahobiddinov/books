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

const STORAGE_KEY = 'read-book-ids'

const loadReadBookIds = () => {
  try {
    const storedIds = window.localStorage.getItem(STORAGE_KEY)
    return storedIds ? (JSON.parse(storedIds) as string[]) : []
  } catch {
    return []
  }
}

function App() {
  const [query, setQuery] = useState('')
  const [readBookIds, setReadBookIds] = useState<string[]>(loadReadBookIds)
  const [selectedId, setSelectedId] = useState(
    () => readBookIds.find((id) => books.some((book) => book.id === id)) ?? books[0]?.id ?? '',
  )
  const readBookSet = useMemo(() => new Set(readBookIds), [readBookIds])

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchingBooks = normalizedQuery
      ? books.filter((book) => book.title.toLowerCase().includes(normalizedQuery))
      : books

    return [...matchingBooks].sort((a, b) => {
      const readDifference =
        Number(readBookSet.has(b.id)) - Number(readBookSet.has(a.id))

      return readDifference || a.title.localeCompare(b.title)
    })
  }, [query, readBookSet])

  const toggleReadBook = (bookId: string) => {
    setReadBookIds((currentIds) => {
      const nextIds = currentIds.includes(bookId)
        ? currentIds.filter((id) => id !== bookId)
        : [...currentIds, bookId]

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds))
      return nextIds
    })
  }

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
                <div
                  className={
                    book.id === selectedBook?.id ? 'book-card active' : 'book-card'
                  }
                  key={book.id}
                >
                  <button
                    className={
                      readBookSet.has(book.id)
                        ? 'read-toggle is-read'
                        : 'read-toggle'
                    }
                    aria-label={
                      readBookSet.has(book.id)
                        ? `${book.title} o'qilgan belgini olib tashlash`
                        : `${book.title} o'qilgan deb belgilash`
                    }
                    aria-pressed={readBookSet.has(book.id)}
                    type="button"
                    onClick={() => toggleReadBook(book.id)}
                  >
                    ★
                  </button>
                  <button
                    className="book-select"
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
                </div>
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
