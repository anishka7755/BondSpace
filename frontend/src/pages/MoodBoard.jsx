import { useState, useEffect } from "react";
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
  MessageCircle, // Corrected icon import
  Plus,
  Image as ImageIcon,
  Music,
  Link2,
  Type,
  Palette,
  Users,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import api from "../api/api";

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
  const [selectedImage, setSelectedImage] = useState(null);

  // Menu control state
  const [openMenuFor, setOpenMenuFor] = useState(null);

  useEffect(() => {
    async function fetchMoodboard() {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/moodboard/${matchId}`);
        const { moodboard, items, comments } = response.data;

        const roomies = moodboard.users.map((u) => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          isYou: u._id === response.data.currentUserId,
        }));
        setRoommates(roomies);

        setMoodboardItems(
          items.map((item) => ({
            id: item._id,
            type: item.type,
            title: item.title || "",
            content: item.content,
            description: item.description || "",
            author: item.owner.firstName + " " + item.owner.lastName,
            authorId: item.owner._id,
            likes: item.likes.length,
            likedByUser: item.likes.some(
              (id) => id === response.data.currentUserId
            ),
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
    }
    fetchMoodboard();
  }, [matchId]);

  const getIcon = (type) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "note":
        return Type;
      case "link":
        return Link2;
      case "playlist":
        return Music;
      default:
        return Plus;
    }
  };

  const startAddingItem = (type) => setNewItemType(type);
  const cancelAdding = () => {
    setNewItemType(null);
    setNewNoteTitle("");
    setNewNoteContent("");
    setSelectedImage(null);
  };

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
      const response = await api.post(`/moodboard/${matchId}/item`, payload);
      const item = response.data;
      setMoodboardItems((items) => [
        {
          id: item._id,
          type: item.type,
          title: item.title || "",
          content: item.content,
          description: item.description || "",
          author: item.owner.firstName + " " + item.owner.lastName,
          authorId: item.owner._id,
          likes: item.likes.length,
          likedByUser: false,
          timestamp: new Date(item.createdAt).toLocaleString(),
        },
        ...items,
      ]);
      setCommentsByItem((c) => ({ ...c, [item._id]: [] }));
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
      const response = await api.post(
        `/moodboard/${matchId}/item/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const item = response.data;
      setMoodboardItems((items) => [
        {
          id: item._id,
          type: item.type,
          title: item.title || "",
          content: item.content,
          description: item.description || "",
          author:
            roommates.find((u) => u._id === item.owner)?.firstName +
              " " +
              roommates.find((u) => u._id === item.owner)?.lastName ||
            "Uploader",
          authorId: item.owner,
          likes: item.likes?.length || 0,
          likedByUser: false,
          timestamp: new Date(item.createdAt).toLocaleString(),
        },
        ...items,
      ]);
      cancelAdding();
      setSelectedImage(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to upload image");
    }
  };

  const toggleLikeItem = async (itemId) => {
    try {
      const response = await api.post(`/moodboard/item/${itemId}/like`);
      const { liked, likesCount } = response.data;
      setMoodboardItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? { ...item, likedByUser: liked, likes: likesCount }
            : item
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDeleteNote = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/moodboard/item/${itemId}`);
      setMoodboardItems((items) => items.filter((item) => item.id !== itemId));
      setCommentsByItem((comments) => {
        const copy = { ...comments };
        delete copy[itemId];
        return copy;
      });
      if (openMenuFor === itemId) setOpenMenuFor(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete note");
    }
  };

  if (loading) return <div className="p-8">Loading Moodboard...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary">
      <div className="sticky top-0 z-10 bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="flex items-center space-x-2 text-2xl font-bold text-primary">
          <Palette className="w-6 h-6" />
          <span>Shared Moodboard</span>
        </h1>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          {roommates.map((user) => (
            <div
              key={user._id}
              style={{
                padding: "8px 12px",
                backgroundColor: "#fff6ef",
                borderRadius: 6,
                boxShadow: "0 0 5px rgba(255,115,0,0.15)",
                fontWeight: 600,
                color: "#ad6c02",
                whiteSpace: "nowrap",
              }}
              title={user.email}
            >
              {user.firstName} {user.lastName}
              {user.isYou ? " (You)" : ""}
            </div>
          ))}
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        <section className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Users className="w-5 h-5 text-secondary" />
            Add to Moodboard
          </h2>

          {!newItemType ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {["note", "image", "link", "playlist"].map((type) => {
                const Icon = getIcon(type);
                return (
                  <Button
                    key={type}
                    variant="outline"
                    onClick={() => startAddingItem(type)}
                    className="flex flex-col items-center py-6"
                  >
                    <Icon className="w-7 h-7" />
                    <span className="mt-2 text-sm capitalize">{type}</span>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="max-w-md space-y-4">
              <Button variant="ghost" onClick={cancelAdding}>
                ← Back to Moodboard
              </Button>

              {newItemType === "note" && (
                <>
                  <Input
                    placeholder="Title (optional)"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Your note"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote}>Add Note</Button>
                    <Button variant="outline" onClick={cancelAdding}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {newItemType === "image" && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelected}
                    className="mb-4"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImageUpload}
                      disabled={!selectedImage}
                    >
                      Upload Image
                    </Button>
                    <Button variant="outline" onClick={cancelAdding}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}

              {["link", "playlist"].includes(newItemType) && (
                <p className="text-muted-foreground">Feature coming soon!</p>
              )}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moodboardItems.map((item) => {
            const Icon = getIcon(item.type);
            const comments = commentsByItem[item.id] || [];
            const isMenuOpen = openMenuFor === item.id;

            return (
              <Card key={item.id} className="relative shadow">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-secondary" />
                      <CardTitle>{item.title || item.type}</CardTitle>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        aria-label="More options"
                        title="Options"
                        onClick={() =>
                          setOpenMenuFor(isMenuOpen ? null : item.id)
                        }
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                      {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-28 rounded border border-gray-300 bg-white shadow-lg z-50">
                          <button
                            className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 font-semibold"
                            onClick={() => handleDeleteNote(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>
                        {item.author
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span>{item.author}</span>
                    <span>•</span>
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {item.type === "image" && (
                    <img
                      src={item.content}
                      alt={item.title}
                      className="rounded-lg w-full max-h-48 object-cover"
                    />
                  )}
                  {item.type === "note" && (
                    <pre className="whitespace-pre-wrap">{item.content}</pre>
                  )}
                  {item.type === "link" && (
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {item.content}
                    </a>
                  )}
                  {item.type === "playlist" && (
                    <div className="bg-secondary rounded p-3">
                      <Music className="inline-block mr-2" /> {item.content}
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between mt-4 border-t pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLikeItem(item.id)}
                      className="flex items-center gap-1"
                    >
                      <Heart className="w-4 h-4" /> <span>{item.likes}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled
                      className="flex items-center gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />{" "}
                      <span>{comments.length}</span>
                    </Button>
                  </div>

                  {comments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="bg-muted rounded p-2 text-sm"
                        >
                          <strong>{c.author}:</strong> {c.content}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default Moodboard;
