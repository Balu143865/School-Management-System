import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  BookMarked,
  ArrowRightLeft,
  Trash2,
  UserCheck,
  Building2,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { Book, BookBorrowing, User } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { useAuth } from '../../context/AuthContext';

export const LibraryManager: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowings, setBorrowings] = useState<BookBorrowing[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [activeTab, setActiveTab] = useState<'catalog' | 'borrowings'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [borrowingStatusFilter, setBorrowingStatusFilter] = useState<string>('all');

  // Modals
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedBookForCheckout, setSelectedBookForCheckout] = useState<Book | null>(null);
  const [deleteBookTarget, setDeleteBookTarget] = useState<Book | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State - New Book
  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    author: '',
    category: 'Literature',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 5,
    locationRack: 'Rack A-1',
    synopsis: ''
  });

  // Form State - Checkout
  const [checkoutData, setCheckoutData] = useState({
    bookId: '',
    studentId: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadLibraryData();
  }, []);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const [booksData, borrowingsData, usersData] = await Promise.all([
        api.getBooks(),
        api.getBorrowings(),
        api.getUsers()
      ]);
      setBooks(booksData);
      setBorrowings(borrowingsData);
      setStudents(usersData.filter(u => u.role === 'student'));
    } catch (err) {
      console.error('Error loading library data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      const added = await api.addBook({
        isbn: newBook.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        title: newBook.title,
        author: newBook.author,
        category: newBook.category,
        publisher: newBook.publisher || 'Academic Press',
        publishedYear: Number(newBook.publishedYear),
        totalCopies: Number(newBook.totalCopies),
        availableCopies: Number(newBook.totalCopies),
        locationRack: newBook.locationRack,
        synopsis: newBook.synopsis
      });

      setBooks(prev => [...prev, added]);
      setFormSuccess(`Book "${added.title}" successfully added to inventory!`);
      setTimeout(() => {
        setIsAddBookModalOpen(false);
        setFormSuccess(null);
        setNewBook({
          isbn: '',
          title: '',
          author: '',
          category: 'Literature',
          publisher: '',
          publishedYear: new Date().getFullYear(),
          totalCopies: 5,
          locationRack: 'Rack A-1',
          synopsis: ''
        });
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add book');
    }
  };

  const handleOpenCheckout = (book?: Book) => {
    if (book) {
      setSelectedBookForCheckout(book);
      setCheckoutData(prev => ({ ...prev, bookId: book.id }));
    } else if (books.length > 0) {
      const availableBook = books.find(b => b.availableCopies > 0) || books[0];
      setSelectedBookForCheckout(availableBook);
      setCheckoutData(prev => ({ ...prev, bookId: availableBook.id }));
    }
    if (students.length > 0) {
      setCheckoutData(prev => ({ ...prev, studentId: students[0].id }));
    }
    setIsCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const targetStudent = students.find(s => s.id === checkoutData.studentId);
    if (!targetStudent) {
      setFormError('Please select a valid student.');
      return;
    }

    const targetBook = books.find(b => b.id === checkoutData.bookId);
    if (!targetBook) {
      setFormError('Please select a valid book.');
      return;
    }

    try {
      const borrowing = await api.checkoutBook({
        bookId: targetBook.id,
        studentId: targetStudent.id,
        studentName: targetStudent.name,
        studentClass: targetStudent.className || 'Class 10-A',
        dueDate: checkoutData.dueDate,
        issuedBy: user?.name || 'Librarian'
      });

      setFormSuccess(`Book "${targetBook.title}" checked out to ${targetStudent.name}!`);
      setBorrowings(prev => [borrowing, ...prev]);
      
      // Update local book count
      setBooks(prev => prev.map(b => b.id === targetBook.id ? { ...b, availableCopies: b.availableCopies - 1 } : b));

      setTimeout(() => {
        setIsCheckoutModalOpen(false);
        setFormSuccess(null);
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to check out book');
    }
  };

  const handleReturnBook = async (borrowingId: string) => {
    try {
      const updatedBorrowing = await api.returnBook(borrowingId);
      setBorrowings(prev => prev.map(b => b.id === borrowingId ? updatedBorrowing : b));

      // Increase available copy
      setBooks(prev => prev.map(b => b.id === updatedBorrowing.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b));
    } catch (err) {
      console.error('Error returning book:', err);
    }
  };

  const confirmDeleteBook = async () => {
    if (!deleteBookTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteBook(deleteBookTarget.id);
      setBooks(prev => prev.filter(b => b.id !== deleteBookTarget.id));
      setDeleteBookTarget(null);
    } catch (err) {
      console.error('Error deleting book:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const totalBooks = books.length;
  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const activeBorrowingsCount = borrowings.filter(b => b.status === 'active').length;
  const overdueBorrowingsCount = borrowings.filter(b => b.status === 'overdue').length;

  // Categories list
  const categories = Array.from(new Set(books.map(b => b.category)));

  // Filtered books
  const filteredBooks = books.filter(b => {
    const matchesQuery = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  // Filtered borrowings
  const filteredBorrowings = borrowings.filter(b => {
    const matchesQuery = b.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = borrowingStatusFilter === 'all' || b.status === borrowingStatusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400 border border-indigo-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>Library Management Hub</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-medium">Catalog & Circulation</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage school book catalog, track student check-outs, rack locations, and return due dates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>

          <button
            onClick={() => handleOpenCheckout()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 transition shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Issue Book</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Catalog Titles</p>
            <p className="text-lg font-bold text-slate-900">{totalBooks} <span className="text-xs text-slate-400 font-normal">({totalCopies} copies)</span></p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Available Copies</p>
            <p className="text-lg font-bold text-slate-900">{availableCopies} / {totalCopies}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Borrowings</p>
            <p className="text-lg font-bold text-slate-900">{activeBorrowingsCount}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Overdue Returns</p>
            <p className="text-lg font-bold text-rose-600">{overdueBorrowingsCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex p-1 bg-slate-100 rounded-xl self-start">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Book Catalog ({filteredBooks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('borrowings')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'borrowings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-600" />
              <span>Borrowing Records ({filteredBorrowings.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={activeTab === 'catalog' ? "Search title, author, ISBN..." : "Search student, book title..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {activeTab === 'catalog' ? (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <select
                value={borrowingStatusFilter}
                onChange={(e) => setBorrowingStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="overdue">Overdue</option>
                <option value="returned">Returned</option>
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Book Catalog */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                No books found matching criteria. Click "Add Book" to expand inventory.
              </div>
            ) : (
              filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-200/80 transition flex flex-col justify-between group space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {book.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {book.locationRack}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">By {book.author}</p>
                    </div>

                    {book.synopsis && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{book.synopsis}"
                      </p>
                    )}

                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                      <span>ISBN: {book.isbn}</span>
                      <span>{book.publishedYear}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="text-xs font-semibold">
                      {book.availableCopies > 0 ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {book.availableCopies} of {book.totalCopies} Available
                        </span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          All {book.totalCopies} Copies Checked Out
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenCheckout(book)}
                        disabled={book.availableCopies <= 0}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 text-indigo-700 font-semibold rounded-lg text-xs transition border border-indigo-200/60"
                      >
                        Issue
                      </button>
                      <button
                        onClick={() => setDeleteBookTarget(book)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Borrowing Records */}
        {activeTab === 'borrowings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Student Borrower</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBorrowings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400 text-xs">
                      No active or past borrowing records found.
                    </td>
                  </tr>
                ) : (
                  filteredBorrowings.map((brw) => (
                    <tr key={brw.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">{brw.bookTitle}</td>
                      <td className="p-3 font-medium text-slate-800">{brw.studentName}</td>
                      <td className="p-3 text-slate-500">{brw.studentClass}</td>
                      <td className="p-3 text-slate-500">{brw.borrowedDate}</td>
                      <td className="p-3 font-medium text-slate-700">{brw.dueDate}</td>
                      <td className="p-3">
                        {brw.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Clock className="w-3 h-3" /> Active
                          </span>
                        )}
                        {brw.status === 'overdue' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Overdue ($5 Fine)
                          </span>
                        )}
                        {brw.status === 'returned' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> Returned ({brw.returnedDate})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {brw.status !== 'returned' && (
                          <button
                            onClick={() => handleReturnBook(brw.id)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs border border-emerald-200 transition flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Mark Returned</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Add New Book */}
      <Modal isOpen={isAddBookModalOpen} onClose={() => setIsAddBookModalOpen(false)} title="Add Book to Library Catalog">
        <form onSubmit={handleAddBook} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
              {formSuccess}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fundamental Physics Volume II"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Author *</label>
              <input
                type="text"
                required
                placeholder="Author Name"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Category</label>
              <select
                value={newBook.category}
                onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="Literature">Literature</option>
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Technology">Technology</option>
                <option value="History">History</option>
                <option value="Fiction">Fiction</option>
                <option value="General">General Knowledge</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Copies</label>
              <input
                type="number"
                min={1}
                required
                value={newBook.totalCopies}
                onChange={(e) => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Rack Location</label>
              <input
                type="text"
                placeholder="Rack B-3"
                value={newBook.locationRack}
                onChange={(e) => setNewBook({ ...newBook, locationRack: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Year</label>
              <input
                type="number"
                value={newBook.publishedYear}
                onChange={(e) => setNewBook({ ...newBook, publishedYear: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Synopsis / Overview</label>
            <textarea
              rows={2}
              placeholder="Short description of the book content..."
              value={newBook.synopsis}
              onChange={(e) => setNewBook({ ...newBook, synopsis: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save Book to Inventory</span>
          </button>
        </form>
      </Modal>

      {/* Modal 2: Issue / Checkout Book */}
      <Modal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} title="Issue Book to Student">
        <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
              {formSuccess}
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Book</label>
            <select
              value={checkoutData.bookId}
              onChange={(e) => setCheckoutData({ ...checkoutData, bookId: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {books.map(b => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} ({b.availableCopies} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Student Borrower</label>
            <select
              value={checkoutData.studentId}
              onChange={(e) => setCheckoutData({ ...checkoutData, studentId: e.target.value })}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.className || 'Class 10-A'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Return Due Date</label>
            <input
              type="date"
              required
              value={checkoutData.dueDate}
              onChange={(e) => setCheckoutData({ ...checkoutData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Confirm Book Issue</span>
          </button>
        </form>
      </Modal>

      {/* Confirm Delete Book Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteBookTarget}
        onClose={() => setDeleteBookTarget(null)}
        onConfirm={confirmDeleteBook}
        title="Delete Library Book"
        itemName={deleteBookTarget?.title}
        description={`Are you sure you want to permanently remove "${deleteBookTarget?.title || ''}" from the library catalog?`}
        isLoading={isDeleting}
      />
    </div>
  );
};
