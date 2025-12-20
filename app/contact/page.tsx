import Header from "@/components/Header";

export default function ContactPage() {
  // あなたのFormspree URLに書き換え済み
  const FORMSPREE_URL = "https://formspree.io/f/xqezewqa";

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      
      <main className="max-w-md mx-auto p-6">
        <header className="text-center mb-8 pt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            💡 お問い合わせ・要望
          </h1>
          <p className="text-xs text-gray-500">
            NOMIをより良くするためのご意見をお聞かせください。
          </p>
        </header>

        <div className="bg-white shadow-sm border border-gray-100 rounded-3xl p-6">
          <form 
            action={FORMSPREE_URL} 
            method="POST" 
            className="space-y-6"
          >
            {/* お名前 */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 tracking-widest">
                お名前
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="メルカリ 太郎"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 transition text-sm text-black"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 tracking-widest">
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="example@nomi.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 transition text-sm text-black"
              />
            </div>

            {/* メッセージ */}
            <div>
              <label htmlFor="message" className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 tracking-widest">
                内容
              </label>
              <textarea
                name="message"
                id="message"
                rows={6}
                required
                placeholder="不具合の報告や、追加してほしい機能などをご記入ください。"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-red-500 transition text-sm text-black resize-none"
              />
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-gray-800 active:scale-95 transition duration-200"
            >
              運営に送信する
            </button>
            
            <p className="text-center text-[10px] text-gray-400 pt-2">
              ※送信後、確認画面（Formspree）に移動します。
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
