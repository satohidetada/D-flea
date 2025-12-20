"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [sellingItems, setSellingItems] = useState<any[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("selling"); // タブ管理
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        
        // 1. 出品した商品
        const qSelling = query(collection(db, "items"), where("sellerId", "==", u.uid), orderBy("createdAt", "desc"));
        const snapSelling = await getDocs(qSelling);
        setSellingItems(snapSelling.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 2. 購入した商品
        const qPurchased = query(collection(db, "items"), where("buyerId", "==", u.uid), orderBy("soldAt", "desc"));
        const snapPurchased = await getDocs(qPurchased);
        setPurchasedItems(snapPurchased.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 3. いいねした商品
        const qLikes = query(collection(db, "users", u.uid, "likes"));
        const snapLikes = await getDocs(qLikes);
        const likedItemIds = snapLikes.docs.map(d => d.id);
        
        if (likedItemIds.length > 0) {
          // 商品IDの配列を使って、実際の各商品データを取得
          const itemsData = await Promise.all(
            likedItemIds.map(async (id) => {
              const d = await getDocs(query(collection(db, "items"), where("__name__", "==", id)));
              return d.docs[0] ? { id: d.docs[0].id, ...d.docs[0].data() } : null;
            })
          );
          setLikedItems(itemsData.filter(i => i !== null));
        }
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if(confirm("ログアウトしますか？")) {
      await signOut(auth);
      router.push("/");
    }
  };

  if (!user) return <div className="p-10 text-center text-black">読み込み中...</div>;

  const ItemCard = ({ item }: { item: any }) => (
    <Link href={`/items/${item.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 block">
      <div className="relative aspect-square">
        <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
        {item.isSold && (
          <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-md">SOLD</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 truncate">{item.name}</p>
        <p className="font-bold text-red-600">¥{item.price?.toLocaleString()}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="max-w-2xl mx-auto p-4">
        {/* プロフィール */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-50 mb-3 bg-gray-100 shadow-sm">
            {user.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">👤</div>
            )}
          </div>
          <h2 className="text-lg font-bold">{user.displayName || "ユーザー"}</h2>
          <div className="flex gap-2 mt-4">
            <Link href="/profile" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-xs font-bold">プロフィール編集</Link>
            <button onClick={handleLogout} className="border border-gray-200 text-gray-400 px-4 py-2 rounded-full text-xs font-bold">ログアウト</button>
          </div>
        </div>

        {/* タブ切り替えメニュー */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-2xl px-2">
          {[
            { id: "selling", label: "出品", count: sellingItems.length },
            { id: "purchased", label: "購入", count: purchasedItems.length },
            { id: "liked", label: "いいね", count: likedItems.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-xs font-bold transition-all relative ${
                activeTab === tab.id ? "text-red-600" : "text-gray-400"
              }`}
            >
              {tab.label} <span className="ml-1 opacity-60">{tab.count}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* コンテンツエリア */}
        <div className="grid grid-cols-2 gap-3">
          {activeTab === "selling" && sellingItems.map(item => <ItemCard key={item.id} item={item} />)}
          {activeTab === "purchased" && purchasedItems.map(item => <ItemCard key={item.id} item={item} />)}
          {activeTab === "liked" && likedItems.map(item => <ItemCard key={item.id} item={item} />)}
        </div>

        {/* 空の状態 */}
        {((activeTab === "selling" && sellingItems.length === 0) ||
          (activeTab === "purchased" && purchasedItems.length === 0) ||
          (activeTab === "liked" && likedItems.length === 0)) && (
          <div className="py-20 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
            表示する商品がありません
          </div>
        )}
      </main>
    </div>
  );
}
