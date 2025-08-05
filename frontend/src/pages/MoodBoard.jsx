import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Plus,
  Image as ImageIcon,
  DollarSign,
  Link2,
  Type,
  Palette,
  Users,
  MoreHorizontal,
  Sparkles,
  Receipt,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  Star,
  Bookmark,
  ArrowLeft,
  PieChart,
  FileText,
  ExternalLink,
} from "lucide-react";
import api from "../api/api";

const REFRESH_INTERVAL = 1000000; // in ms

const Moodboard = () => {
  const { matchId } = useParams();

  // State variables
  const [roommates, setRoommates] = useState([]);
  const [moodboardItems, setMoodboardItems] = useState([]);
  const [commentsByItem, setCommentsByItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add item state
  const [newItemType, setNewItemType] = useState(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteDesc, setNewNoteDesc] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Expense specific states
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseSplitWith, setExpenseSplitWith] = useState([]);

  // Menu control state
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [showExpenseDetails, setShowExpenseDetails] = useState(true);

  // Mock expense data for demo
  const [mockExpenses, setMockExpenses] = useState([
    {
      id: "exp1",
      title: "Groceries",
      amount: 127.5,
      category: "Food",
      author: "John Doe",
      date: "2024-01-15",
      splitWith: ["Jane", "Mike"],
      yourShare: 42.5,
    },
    {
      id: "exp2",
      title: "Netflix Subscription",
      amount: 15.99,
      category: "Entertainment",
      author: "Jane Smith",
      date: "2024-01-14",
      splitWith: ["John", "Mike"],
      yourShare: 5.33,
    },
    {
      id: "exp3",
      title: "Internet Bill",
      amount: 89.99,
      category: "Utilities",
      author: "Mike Johnson",
      date: "2024-01-13",
      splitWith: ["John", "Jane"],
      yourShare: 29.99,
    },
    {
      id: "exp4",
      title: "Pizza Night",
      amount: 35.8,
      category: "Food",
      author: "You",
      date: "2024-01-12",
      splitWith: ["John", "Jane"],
      yourShare: 11.93,
    },
  ]);

  // Fetch moodboard data (useCallback for stable interval)
  const fetchMoodboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/moodboard/${matchId}`);
      const { moodboard, items, comments, currentUserId } = response.data;

      setRoommates(
        moodboard.users.map((u) => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          isYou: u._id === currentUserId,
        }))
      );

      setMoodboardItems(
        items.map((item) => ({
          id: item._id,
          type: item.type,
          title: item.title || "",
          content: item.content,
          description: item.description || "",
          image: item.image || null,
          author: item.owner.firstName + " " + item.owner.lastName,
          authorId: item.owner._id,
          likes: item.likes.length,
          likedByUser: item.likes.some((id) => id === currentUserId),
          timestamp: new Date(item.createdAt).toLocaleString(),
        }))
      );

      const commentsGrouped = {};
      for (const comment of comments) {
        const iid = comment.itemId;
        if (!commentsGrouped[iid]) commentsGrouped[iid] = [];
        commentsGrouped[iid].push({
          id: comment._id,
          author: comment.author.firstName + " " + comment.author.lastName,
          content: comment.text,
          timestamp: new Date(comment.createdAt).toLocaleString(),
        });
      }
      setCommentsByItem(commentsGrouped);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  // Live polling: fetch initial & every 10s
  useEffect(() => {
    fetchMoodboard();
    const interval = setInterval(fetchMoodboard, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchMoodboard]);

  const startAddingItem = (type) => {
    setNewItemType(type);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteDesc("");
    setSelectedImage(null);
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseSplitWith([]);
  };

  const cancelAdding = () => {
    setNewItemType(null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteDesc("");
    setSelectedImage(null);
    setExpenseAmount("");
    setExpenseCategory("");
    setExpenseSplitWith([]);
  };

  // Use fetchMoodboard after POST to ensure sync
  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      alert("Note content cannot be empty");
      return;
    }
    try {
      const payload = {
        type: "note",
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      };
      await api.post(`/moodboard/${matchId}`, payload);
      await fetchMoodboard();
      cancelAdding();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleImageSelected = (e) => setSelectedImage(e.target.files[0]);

  const handleImageUpload = async () => {
    if (!selectedImage) {
      alert("Please select an image");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      await api.post(`/moodboard/${matchId}/image`, formData);
      await fetchMoodboard();
      setSelectedImage(null);
      cancelAdding();
    } catch (err) {
      alert(
        err.response?.data?.message || err.message || "Failed to upload image"
      );
      return;
    }
  };

  const handleAddLink = async () => {
    if (!newNoteContent.trim()) {
      alert("Please enter a URL");
      return;
    }
    try {
      const payload = {
        type: "link",
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        description: newNoteDesc.trim(),
      };
      await api.post(`/moodboard/${matchId}`, payload);
      await fetchMoodboard();
      cancelAdding();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAddExpense = () => {
    if (!newNoteTitle.trim() || !expenseAmount.trim()) {
      alert("Please fill in expense title and amount");
      return;
    }
    const newExpense = {
      id: `exp_${Date.now()}`,
      title: newNoteTitle.trim(),
      amount: parseFloat(expenseAmount),
      category: expenseCategory || "General",
      author:
        roommates.find((u) => u.isYou)?.firstName +
          " " +
          roommates.find((u) => u.isYou)?.lastName || "You",
      date: new Date().toISOString().split("T")[0],
      splitWith: expenseSplitWith,
      yourShare: parseFloat(expenseAmount) / (expenseSplitWith.length + 1),
    };
    setMockExpenses((prev) => [newExpense, ...prev]);
    cancelAdding();
  };

  const toggleLikeItem = async (itemId) => {
    try {
      await api.post(`/moodboard/item/${itemId}/like`);
      await fetchMoodboard();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteNote = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/moodboard/item/${itemId}`);
      await fetchMoodboard();
      setCommentsByItem((comments) => {
        const copy = { ...comments };
        delete copy[itemId];
        return copy;
      });
      if (openMenuFor === itemId) setOpenMenuFor(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete item");
    }
  };

  const handleDeleteExpense = (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;
    setMockExpenses((prev) => prev.filter((exp) => exp.id !== expenseId));
  };

  // Group items by type
  const groupedItems = {
    links: moodboardItems.filter((item) => item.type === "link"),
    notes: moodboardItems.filter((item) => item.type === "note"),
    images: moodboardItems.filter((item) => item.type === "image"),
    expenses: mockExpenses,
  };

  const totalExpenses = mockExpenses.reduce(
    (sum, exp) => sum + exp.yourShare,
    0
  );
  const totalAmount = mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // RENDER CARD COMPONENTS

  const renderLinkItem = (item) => (
    <div
      key={item.id}
      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <ExternalLink className="w-4 h-4 text-gray-500" />
          <h4 className="font-medium text-gray-800 text-sm truncate">
            {item.title || "Link"}
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setOpenMenuFor(openMenuFor === item.id ? null : item.id)
          }
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 h-auto"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      <a
        href={item.content}
        target="_blank"
        rel="noreferrer"
        className="text-gray-600 hover:text-gray-800 text-xs underline block truncate mb-3"
      >
        {item.content}
      </a>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{item.author}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleLikeItem(item.id)}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 h-auto"
        >
          <Heart
            className={`w-3 h-3 ${item.likedByUser ? "fill-gray-600" : ""}`}
          />
          <span className="text-xs ml-1">{item.likes}</span>
        </Button>
      </div>
    </div>
  );

  const renderNoteItem = (item) => (
    <div
      key={item.id}
      className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 flex-1">
          <FileText className="w-4 h-4 text-gray-500" />
          <h4 className="font-medium text-gray-800 text-sm truncate">
            {item.title || "Note"}
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setOpenMenuFor(openMenuFor === item.id ? null : item.id)
          }
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 h-auto"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <pre className="text-gray-700 text-xs whitespace-pre-wrap leading-relaxed line-clamp-4">
          {item.content}
        </pre>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{item.author}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleLikeItem(item.id)}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 h-auto"
        >
          <Heart
            className={`w-3 h-3 ${item.likedByUser ? "fill-gray-600" : ""}`}
          />
          <span className="text-xs ml-1">{item.likes}</span>
        </Button>
      </div>
    </div>
  );

  const renderImageItem = (item) => (
    <div
      key={item.id}
      className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center">
        <img
          src={item.content}
          alt={item.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between p-2">
        <span className="text-gray-500 text-xs truncate">{item.author}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleLikeItem(item.id)}
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 h-auto"
        >
          <Heart
            className={`w-3 h-3 ${item.likedByUser ? "fill-gray-600" : ""}`}
          />
          <span className="text-xs ml-1">{item.likes}</span>
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading moodboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200 max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h2 className="text-lg font-medium text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto p-6">
          <h1 className="flex items-center space-x-3 text-xl font-medium text-gray-800">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Palette className="w-5 h-5 text-gray-600" />
            </div>
            <span>Shared Moodboard</span>
          </h1>
          <div className="flex gap-2 flex-wrap">
            {roommates.map((user) => (
              <div
                key={user._id}
                className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                title={user.email}
              >
                {user.firstName} {user.lastName}
                {user.isYou && <span className="ml-1 text-gray-400">•</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Add Items Section */}
        <section className="mb-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="flex items-center gap-3 text-lg font-medium mb-6 text-gray-800">
            Add Content
          </h2>

          {!newItemType ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { type: "note", icon: FileText, label: "Note" },
                { type: "image", icon: ImageIcon, label: "Image" },
                { type: "link", icon: ExternalLink, label: "Link" },
                { type: "expense", icon: DollarSign, label: "Expense" },
              ].map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => startAddingItem(type)}
                  className="h-20 flex flex-col items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {label}
                  </span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl space-y-4">
              <Button
                variant="ghost"
                onClick={cancelAdding}
                className="text-gray-600 hover:bg-gray-100 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {newItemType === "note" && (
                <>
                  <Input
                    placeholder="Note title (optional)"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <Textarea
                    placeholder="Write your note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={4}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddNote}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg"
                    >
                      Add Note
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelAdding}
                      className="border-gray-200 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {newItemType === "image" && (
                <>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelected}
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleImageUpload}
                      disabled={!selectedImage}
                      className="bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white font-medium rounded-lg"
                    >
                      Upload Image
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelAdding}
                      className="border-gray-200 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {newItemType === "link" && (
                <>
                  <Input
                    placeholder="Link title (optional)"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <Input
                    type="url"
                    placeholder="Paste URL (https://...)"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    rows={2}
                    value={newNoteDesc}
                    onChange={(e) => setNewNoteDesc(e.target.value)}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddLink}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg"
                    >
                      Add Link
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelAdding}
                      className="border-gray-200 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {newItemType === "expense" && (
                <>
                  <Input
                    placeholder="Expense title"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="border-gray-200 focus:border-gray-400 rounded-lg"
                  />
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full p-3 border border-gray-200 focus:border-gray-400 rounded-lg bg-white"
                  >
                    <option value="">Select Category</option>
                    <option value="Food">Food</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Transportation">Transportation</option>
                    <option value="General">General</option>
                  </select>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddExpense}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg"
                    >
                      Add Expense
                    </Button>
                    <Button
                      variant="outline"
                      onClick={cancelAdding}
                      className="border-gray-200 rounded-lg"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Content Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Links Section */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {groupedItems.links.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-medium text-base mb-4 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  Links ({groupedItems.links.length})
                </h3>
                <div className="space-y-3">
                  {groupedItems.links.map(renderLinkItem)}
                </div>
              </div>
            )}

            {groupedItems.links.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <ExternalLink className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-600 font-medium text-base mb-2">
                  No links yet
                </h3>
                <p className="text-gray-500 text-sm">
                  Add your first link to get started
                </p>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm h-full">
              <h3 className="text-gray-800 font-medium text-base mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Notes ({groupedItems.notes.length})
              </h3>
              {groupedItems.notes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groupedItems.notes.map(renderNoteItem)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mb-3" />
                  <h4 className="text-gray-600 font-medium text-base mb-2">
                    No notes yet
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Start adding notes to capture ideas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Images and Expense Tracker */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Expense Tracker Section */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800 font-medium text-base flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                  </div>
                  Expense Tracker
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpenseDetails(!showExpenseDetails)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  {showExpenseDetails ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <p className="text-green-700 text-sm font-medium">
                    Total Spent
                  </p>
                  <p className="text-green-800 text-lg font-semibold">
                    ${totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                  <PieChart className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-700 text-sm font-medium">
                    Your Share
                  </p>
                  <p className="text-blue-800 text-lg font-semibold">
                    ${totalExpenses.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Recent Expenses */}
              {showExpenseDetails && (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  <h4 className="text-gray-700 font-medium text-sm mb-3 flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Recent Expenses
                  </h4>
                  {mockExpenses.slice(0, 4).map((expense) => (
                    <div
                      key={expense.id}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-medium text-gray-800 text-sm">
                            {expense.title}
                          </h5>
                          <p className="text-gray-600 text-xs">
                            {expense.category} • {expense.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-800 text-sm">
                            ${expense.amount.toFixed(2)}
                          </p>
                          <p className="text-gray-600 text-xs">
                            You: ${expense.yourShare.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">
                          {expense.author}
                        </span>
                        {expense.splitWith.length > 0 && (
                          <div className="flex gap-1">
                            {expense.splitWith.slice(0, 2).map((person) => (
                              <span
                                key={person}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {person}
                              </span>
                            ))}
                            {expense.splitWith.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{expense.splitWith.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images Section */}
            {groupedItems.images.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-medium text-base mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  Photos ({groupedItems.images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {groupedItems.images.map(renderImageItem)}
                </div>
              </div>
            )}

            {groupedItems.images.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="text-gray-600 font-medium text-base mb-2">
                  No photos yet
                </h3>
                <p className="text-gray-500 text-sm">
                  Share your favorite moments
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Menu */}
        {openMenuFor && (
          <div
            className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
            onClick={() => setOpenMenuFor(null)}
          >
            <div
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-gray-800 font-medium text-lg mb-2">
                Delete Item?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const item = [
                      ...groupedItems.links,
                      ...groupedItems.notes,
                      ...groupedItems.images,
                    ].find((i) => i.id === openMenuFor);
                    if (item) handleDeleteNote(openMenuFor);
                    setOpenMenuFor(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setOpenMenuFor(null)}
                  className="border-gray-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Moodboard;
