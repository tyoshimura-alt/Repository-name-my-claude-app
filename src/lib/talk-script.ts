export type ScriptStep = {
  id: string;
  label: string;
  text: string;
};

export type IndustryHook = {
  id: string;
  industry: string;
  tasks: string;
  hook: string;
};

export type ObjectionPair = {
  id: string;
  objection: string;
  rebuttal: string;
};

export type TalkScript = {
  title: string;
  flow: string;
  point: string;
  steps: ScriptStep[];
  industryHooks: IndustryHook[];
  objections: ObjectionPair[];
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export const DEFAULT_TALK_SCRIPT: TalkScript = {
  title: "岡山電力AI事業部 新規・業種別フロントトークスクリプト",
  flow: "名乗り（社名で信用）→接続→事例フック→依頼→日程二択　※社名やAI事業部の名乗り方は状況に応じて変えて試す",
  point:
    "事例フックは「〜にお時間かかってないですか？」と聞かない（「ないです」を誘発してしまう）。事例として言い切り、③→④→⑤を止まらず一気に話す。",
  steps: [
    {
      id: "step-1",
      label: "① 受付",
      text: "お世話になっております。岡山電力の◯◯です。代表の◯◯様、（不明時：経理・総務）いらっしゃいますでしょうか。",
    },
    {
      id: "step-2",
      label: "② 接続後（用件を聞かれたら）",
      text: "岡山電力AI事業部の◯◯です。県内の事業所様にお配りしている業務改善の事例資料の件で、とお伝えください。",
    },
    {
      id: "step-3",
      label: "③ 事例フック",
      text: "同じ【業種】の皆様で、【業種別】（下表）という事例が出ております。",
    },
    {
      id: "step-4",
      label: "④ 依頼",
      text: "（日報・マニュアル作成、HP更新などAIを使って外注コストを0円に出来た事例がございます）その事例資料をお持ちして、ご挨拶させて頂きたくお電話しました。",
    },
    {
      id: "step-5",
      label: "⑤ 二択",
      text: "来週ですと火曜と木曜、どちらがご都合よろしいですか？",
    },
  ],
  industryHooks: [
    { id: "ind-1", industry: "士業", tasks: "議事録や記帳チェック", hook: "議事録や記帳の作業時間が半分になった事例が" },
    { id: "ind-2", industry: "不動産", tasks: "紹介文生成、LINE一次対応、追客メール", hook: "物件紹介文の作成と反響対応を自動化し、追客まで回るようになった事例が" },
    { id: "ind-3", industry: "製造業", tasks: "日報集計、手順書生成、点検記録のデータ化", hook: "日報や作業手順書をマニュアル化できた事例が" },
    { id: "ind-4", industry: "小売・EC", tasks: "HP作成・商品文・広告コピー生成、売上レポート", hook: "HPの制作/更新代行費用の削減、SNS投稿の作成時間を大きく減らせた事例が" },
    { id: "ind-5", industry: "飲食業", tasks: "HP作成・口コミ返信文、POP文言、シフト調整", hook: "HPの作成/更新代行費用の削減、SNS投稿を自動化し、集客を強化している事例が" },
    { id: "ind-6", industry: "医療・介護", tasks: "記録要約、研修マニュアル、家族向け資料", hook: "記録や申し送りの書類整理を減らし、ケアに集中できた事例が" },
    { id: "ind-7", industry: "建設業", tasks: "安全書類チェック、写真台帳整理", hook: "見積書・報告書・現場写真整理のスピードが上がった事例が" },
    { id: "ind-8", industry: "人材・採用", tasks: "スカウト文生成、応募者一次対応、選考レポート", hook: "求人票やスカウト文の作成時間を減らせた事例が" },
    { id: "ind-9", industry: "金融・保険", tasks: "提案資料自動作成、契約書チェック", hook: "提案資料や契約書チェックの作業時間を大幅に削減できた事例が" },
    { id: "ind-10", industry: "教育・スクール", tasks: "教材・テスト自動作成、保護者連絡文、広告文", hook: "教材作成やテスト作成を効率化できた事例が" },
    { id: "ind-11", industry: "リース", tasks: "決算書要約、契約書、満了リマインド", hook: "契約書の読み込みから書類作成まで高速化できた事例が" },
  ],
  objections: [
    { id: "obj-1", objection: "電力会社がなぜAIを？", rebuttal: "皆様最初はそうおっしゃるのですが、資料をご覧頂いてから判断頂ければ結構ですので、と伝える。" },
    { id: "obj-2", objection: "忙しい／結構です", rebuttal: "まず弊社自身が15分ほどで成果を出せているので、県内の事業所様にも展開して結果をご確認頂きたいので、と再アプローチする。" },
    { id: "obj-3", objection: "資料だけ送って", rebuttal: "資料をお渡ししながら直接ご説明させて頂きたいので、一度お伺いさせてください。難しければ郵送も可、と伝える。" },
  ],
};
