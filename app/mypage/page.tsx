"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [sellingItems, setSellingItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
        return;
      }
      setUser(currentUser);

      // 通知の取得 (未読優先)
      const qNoti = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      onSnapshot(qNoti, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // 出品・購入リストの取得 (既存コード)
      const qPurchased = query(collection(db, "items"), where("buyerId", "==", currentUser.uid));
      onSnapshot(qPurchased, (s) => setPurchasedItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
      
      const qSelling = query(collection(db, "items"), where("sellerId", "==", currentUser.uid));
      onSnapshot(qSelling, (s) => setSellingItems(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    });
    return () => unsubscribe();
  }, [router]);

  const markAsRead = async (notiId: string, link: string) => {
    await updateDoc(doc(db, "notifications", notiId), { isRead: true });
    router.push(link);
  };

  if (!user) return <div className="p-8 text-black text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 pb-20">
      <header className="flex justify-between items-center mb-6">
        <Link href="/" className="text-red-600 font-bold text-2xl tracking-tighter">NOMI</Link>
        <h1 className="text-lg font-bold">マイページ</h1>
      </header>

      {/* お知らせセクション */}
      {notifications.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-bold text-gray-500 mb-2 px-2">お知らせ</h3>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => markAsRead(n.id, n.link)}
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${n.isRead ? "bg-white opacity-60" : "bg-red-50 border-red-100 shadow-sm"}`}
              >
                <span className="text-xl">🔔</span>
                <div className="flex-1">
                  <p className={`text-sm ${n.isRead ? "font-normal" : "font-bold"}`}>{n.title}</p>
                  <p className="text-xs text-gray-500">{n.body}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* プロフィール (簡略化表示) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-xl font-bold border-2 border-white shadow">
          {user.displayName?.[0]}
        </div>
        <div>
          <h2 className="text-lg font-bold">{user.displayName}</h2>
          <p className="text-gray-400 text-xs">本人確認済</p>
        </div>
      </div>

      {/* 出品・購入リスト (前回のコードを維持) */}
      <section className="mb-8">
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">📤 出品した商品</h3>
        <div className="grid grid-cols-1 gap-2">
          {sellingItems.map(item => (
            <Link href={item.isSold ? `/chat/${item.id}` : `/items/${item.id}/edit`} key={item.id} className="bg-white p-3 rounded-2xl flex items-center border shadow-sm">
              <img src={item.imageUrl} className="w-12 h-12 object-cover rounded-lg mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.name}</p>
                <p className={`text-[10px] font-bold ${item.isSold ? "text-red-500" : "text-blue-500"}`}>
                  {item.isSold ? "売却済：取引画面へ" : "販売中：編集する"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">🛍️ 購入した商品</h3>
        <div className="grid grid-cols-1 gap-2">
          {purchasedItems.map(item => (
            <Link href={`/chat/${item.id}`} key={item.id} className="bg-white p-3 rounded-2xl flex items-center border shadow-sm">
              <img src={item.imageUrl} className="w-12 h-12 object-cover rounded-lg mr-3" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{item.name}</p>
                <p className="text-blue-500 text-[10px] font-bold">取引チャットへ</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <button onClick={() => signOut(auth)} className="w-full p-4 text-gray-400 text-sm font-bold">ログアウト</button>
    </div>
  );
}
