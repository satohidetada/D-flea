import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 pb-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 border-b-2 border-orange-500 pb-2">利用規約</h1>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold text-lg mb-2">第1条（目的）</h2>
            <p>本規約は、本サービス内での物品の出品、購入、およびユーザー間コミュニケーションのルールを定めるものです。</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">第2条（自己責任の原則）</h2>
            <p>本サービスは売買の場を提供する掲示板であり、ユーザー間の取引、メッセージのやり取り、トラブルについて、運営者は一切の責任を負いません。すべて当事者間で解決するものとします。</p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">第3条（禁止事項）</h2>
            <p>以下の行為を禁止します。違反した場合、予告なく投稿削除やアカウント停止を行うことがあります。</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>法令、公序良俗に反する商品の出品</li>
              <li>虚偽の内容を含む投稿、または他者への誹謗中傷</li>
              <li>不正アクセスやサーバーに過度な負担をかける行為</li>
              <li>その他、運営が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-2">第4条（規約の変更）</h2>
            <p>運営者は、必要に応じて本規約を変更できるものとします。変更後の規約は本ページに掲載した時点から効力を生じます。</p>
          </section>

          <div className="mt-10 pt-10 border-t text-center">
            <Link href="/mypage" className="text-orange-500 font-bold hover:underline">
              マイページに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}