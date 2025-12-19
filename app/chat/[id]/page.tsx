"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase/config"; // configに統一
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/");
        return;
      }
      setUser(u);
    });

    const fetchChat = async () => {
      const d = await getDoc(doc(db, "chats", id as string));
      if (d.exists()) {
        setChatInfo(d.data());
      }
    };
    fetchChat();

    const q = query(collection(db, "chats", id as string, "messages"), orderBy("createdAt", "asc"));
    const unsubMsgs = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubAuth();
      unsubMsgs();
    };
  }, [id, router]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    await addDoc(collection(db, "chats", id as string, "messages"), {
      text: input,
      senderId: user.uid,
      senderName: user.displayName,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-black">
      <header className="bg-white p-4 shadow-sm font-bold flex items-center border-b">
        <Link href="/" className="mr-4 text-gray-500 text-xl">✕</Link>
        <span className="text-base">{chatInfo?.itemName || "取引チャット"}</span>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl ${
              m.senderId === user?.uid ? "bg-red-500 text-white rounded-tr-none" : "bg-white text-black shadow-sm"
            }`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2 outline-none focus:border-red-500"
          placeholder="メッセージを入力..."
        />
        <button type="submit" className="bg-red-600 text-white px-5 py-2 rounded-full font-bold">送信</button>
      </form>
    </div>
  );
}
