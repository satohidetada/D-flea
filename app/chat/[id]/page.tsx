"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase/config";
import { collection, doc, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import Link from "next/link";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [chatInfo, setChatInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) { router.push("/"); return; }
      setUser(u);
    });

    const unsubChat = onSnapshot(doc(db, "chats", id as string), (d) => {
      if (d.exists()) setChatInfo(d.data());
    });

    const q = query(collection(db, "chats", id as string, "messages"), orderBy("createdAt", "asc"));
    const unsubMsgs = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubAuth(); unsubChat(); unsubMsgs(); };
  }, [id, router]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || chatInfo?.status === "closed") return;
    await addDoc(collection(db, "chats", id as string, "messages"), {
      text: input,
      senderId: user.uid,
      senderName: user.displayName,
      createdAt: serverTimestamp(),
    });
    setInput("");
  };

  const completeTransaction = async () => {
    if (!window.confirm("受取評価をして取引を完了しますか？\n完了するとメッセージが送れなくなります。")) return;
    setLoading(true);
    try {
      // チャットをクローズ
      await updateDoc(doc(db, "chats", id as string), { status: "closed" });
      // 商品も完了ステータスへ
      await updateDoc(doc(db, "items", id as string), { status: "completed" });
      alert("取引が完了しました！");
    } catch (err) {
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-black">
      <header className="bg-white p-4 shadow-sm font-bold flex items-center border-b justify-between">
        <div className="flex items-center">
          <Link href="/mypage" className="mr-4 text-gray-500 text-xl">←</Link>
          <span className="text-base truncate max-w-[150px]">{chatInfo?.itemName || "取引チャット"}</span>
        </div>
        {user?.uid === chatInfo?.buyerId && chatInfo?.status !== "closed" && (
          <button onClick={completeTransaction} className="bg-red-600 text-white text-xs px-3 py-2 rounded-lg font-bold">
            受取評価する
          </button>
        )}
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatInfo?.status === "closed" && (
          <div className="bg-gray-200 text-gray-600 p-4 rounded-xl text-center text-sm font-bold">
            この取引は完了しました
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === user?.uid ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
              m.senderId === user?.uid ? "bg-red-500 text-white rounded-tr-none" : "bg-white text-black rounded-tl-none"
            }`}>
              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      {chatInfo?.status !== "closed" && (
        <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
          <input 
            value={input} onChange={(e) => setInput(e.target.value)}
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 outline-none focus:border-red-500 text-sm"
            placeholder="メッセージを入力..."
          />
          <button type="submit" disabled={!input.trim()} className="bg-red-600 text-white px-5 py-2 rounded-full font-bold text-sm disabled:bg-gray-300">送信</button>
        </form>
      )}
    </div>
  );
}
