(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile navigation
  const menuButton = $("#menuButton");
  const globalNav = $("#globalNav");

  const setMenuState = (open) => {
    if (!menuButton || !globalNav) return;
    menuButton.setAttribute("aria-expanded", String(open));
    globalNav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  menuButton?.addEventListener("click", () => {
    setMenuState(menuButton.getAttribute("aria-expanded") !== "true");
  });

  $$("a", globalNav).forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setMenuState(false);
  });

  // Scroll progress
  const scrollProgressBar = $("#scrollProgressBar");
  const updateScrollProgress = () => {
    if (!scrollProgressBar) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };
  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  // Reveal animation
  const revealItems = $$(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Reusable keyboard behavior for tab-like button groups
  const enableArrowNavigation = (buttons, onActivate) => {
    buttons.forEach((button, index) => {
      button.addEventListener("keydown", (event) => {
        if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % buttons.length;
        if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = buttons.length - 1;
        buttons[nextIndex].focus();
        onActivate(buttons[nextIndex]);
      });
    });
  };

  // Main experience tabs
  const experienceTabs = $$(".experience-tab");
  const experiencePanels = $$(".experience-panel");

  const activateExperience = (tab) => {
    const key = tab.dataset.experience;
    experienceTabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    experiencePanels.forEach((panel) => {
      const selected = panel.dataset.panel === key;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
      if (selected) {
        panel.classList.remove("is-entering");
        requestAnimationFrame(() => panel.classList.add("is-entering"));
        window.setTimeout(() => panel.classList.remove("is-entering"), 650);
      }
    });
  };

  experienceTabs.forEach((tab) => tab.addEventListener("click", () => activateExperience(tab)));
  enableArrowNavigation(experienceTabs, activateExperience);

  // Mini Web Director experience
  const choiceGroups = $$(".choice-group");
  const selectedConcept = {
    audience: "高校生",
    goal: "イベントに参加してほしい",
    tone: "ワクワク",
    theme: "energy",
  };

  choiceGroups.forEach((group) => {
    const groupName = group.dataset.choiceGroup;
    $$(".choice-button", group).forEach((button) => {
      button.addEventListener("click", () => {
        $$(".choice-button", group).forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        selectedConcept[groupName] = button.dataset.value;
        if (groupName === "tone") selectedConcept.theme = button.dataset.theme || "energy";
      });
    });
  });

  const conceptContent = {
    audience: {
      "高校生": {
        eyebrow: "FOR 高校生",
        title: "今日のアイデアが、\n明日のキッカケになる。",
      },
      "地域の人": {
        eyebrow: "FOR LOCAL COMMUNITY",
        title: "地域の毎日を、\nアイデアでもっと便利に。",
      },
      "新入生": {
        eyebrow: "FOR NEW STUDENTS",
        title: "はじめの一歩を、\n安心とワクワクに。",
      },
    },
    goal: {
      "イベントに参加してほしい": {
        description: "参加する前の不安を減らし、体験したくなる魅力を分かりやすく届けます。",
        button: "体験してみる",
      },
      "商品の魅力を知ってほしい": {
        description: "商品の特徴だけでなく、使う人にとっての価値が伝わるストーリーを設計します。",
        button: "魅力を知る",
      },
      "身近な課題を解決したい": {
        description: "困っている人と課題を明確にし、使いやすい解決策へつなげます。",
        button: "解決策を見る",
      },
    },
    tone: {
      "ワクワク": {
        feedback: "行動したくなる、エネルギーのある企画です。",
        extra: "色・言葉・動きをそろえ、期待感を高めています。",
      },
      "信頼感": {
        feedback: "安心して内容を理解できる企画です。",
        extra: "情報の順序と根拠を整理し、信頼につながる見せ方にしています。",
      },
      "シンプル": {
        feedback: "迷わず目的に進める、整理された企画です。",
        extra: "必要な情報を絞り、操作の分かりやすさを優先しています。",
      },
    },
  };

  const stringHash = (value) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
    }
    return hash;
  };

  const generateConceptButton = $("#generateConcept");
  const websitePreview = $("#websitePreview");

  generateConceptButton?.addEventListener("click", () => {
    const audience = conceptContent.audience[selectedConcept.audience];
    const goal = conceptContent.goal[selectedConcept.goal];
    const tone = conceptContent.tone[selectedConcept.tone];
    if (!audience || !goal || !tone || !websitePreview) return;

    $("#previewEyebrow").textContent = audience.eyebrow;
    $("#previewTitle").innerHTML = audience.title.replace("\n", "<br>");
    $("#previewDescription").textContent = `${selectedConcept.audience}に向けて、${goal.description}`;
    $(".preview-main button", websitePreview).textContent = goal.button;

    websitePreview.classList.remove("theme-energy", "theme-trust", "theme-simple", "is-updating");
    websitePreview.classList.add(`theme-${selectedConcept.theme}`);
    requestAnimationFrame(() => websitePreview.classList.add("is-updating"));
    window.setTimeout(() => websitePreview.classList.remove("is-updating"), 700);

    const scoreSeed = stringHash(`${selectedConcept.audience}-${selectedConcept.goal}-${selectedConcept.tone}`);
    const score = 84 + (scoreSeed % 13);
    $("#conceptScore").textContent = String(score);
    $("#feedbackTitle").textContent = tone.feedback;
    $("#feedbackText").textContent = `${tone.extra} 経営情報学科では、相手・目的・表現を一つの企画として設計します。`;

    generateConceptButton.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.98)" },
        { transform: "scale(1)" },
      ],
      { duration: reducedMotion ? 1 : 280, easing: "ease-out" }
    );
  });

  // Campus map hotspots
  const campusSpots = {
    information: {
      number: "09",
      type: "LEARNING SPACE",
      title: "情報センター（9号館）",
      description: "Webデザインや動画編集に取り組める実習環境。高性能PCやクリエイティブツールを使い、アイデアを形にします。",
      image: "assets/images/class-web.png",
      alt: "情報センターのコンピュータ実習室でWeb制作に取り組む学生",
      tags: ["Web制作", "動画編集", "グループ学習"],
      link: "https://www.gku.ac.jp/about/campusmap/information_center.html",
    },
    plaza: {
      number: "03",
      type: "RELAX & STUDY",
      title: "student plaza・学びラウンジ",
      description: "授業の合間に集まり、話し、学べる場所。パソコンコーナーや自習ゾーンもあり、友だちとの時間と学習を自然につなげます。",
      image: "assets/images/campus-lounge.jpg",
      alt: "吹き抜けと学習スペースがある明るい学生ラウンジ",
      tags: ["自習", "交流", "PCコーナー"],
      link: "https://www.gku.ac.jp/about/campusmap/03_07.html",
    },
    cafeteria: {
      number: "14",
      type: "LUNCH TIME",
      title: "食堂 Cafe Rest 50",
      description: "定食・丼・麺などを選べる学食。友だちと過ごす昼休みは、授業とは違う大学の雰囲気を感じられる時間です。",
      image: "assets/images/student-life.jpg",
      alt: "キャンパス内のテーブルで会話をする学生",
      tags: ["学食", "昼休み", "キャンパスライフ"],
      link: "https://www.gku.ac.jp/about/campusmap/stand.html",
    },
    library: {
      number: "11",
      type: "FOCUS & RESEARCH",
      title: "図書館",
      description: "レポートの資料を探したり、静かに考えを深めたりする学びの拠点。授業で生まれた疑問を、自分で調べる習慣につなげます。",
      image: "assets/images/group-study.jpg",
      alt: "明るい学習スペースで資料を広げて学ぶ学生",
      tags: ["調査", "レポート", "自習"],
      link: "https://www.gku.ac.jp/library/",
    },
  };

  const mapHotspots = $$(".map-hotspot");
  const spotImage = $("#spotImage");

  const activateSpot = (button) => {
    const data = campusSpots[button.dataset.spot];
    if (!data) return;
    mapHotspots.forEach((item) => item.classList.toggle("is-active", item === button));

    if (spotImage) {
      spotImage.animate([{ opacity: 0.25, transform: "scale(1.03)" }, { opacity: 1, transform: "scale(1)" }], {
        duration: reducedMotion ? 1 : 450,
        easing: "ease-out",
      });
      spotImage.src = data.image;
      spotImage.alt = data.alt;
    }

    $("#spotNumber").textContent = data.number;
    $("#spotType").textContent = data.type;
    $("#spotTitle").textContent = data.title;
    $("#spotDescription").textContent = data.description;
    $("#spotTags").innerHTML = data.tags.map((tag) => `<li>${tag}</li>`).join("");
    const link = $("#spotLink");
    link.href = data.link;
    link.setAttribute("aria-label", `${data.title}を公式サイトで見る`);
  };

  mapHotspots.forEach((button) => button.addEventListener("click", () => activateSpot(button)));
  enableArrowNavigation(mapHotspots, activateSpot);

  // Student day timeline
  const dayData = {
    morning: {
      image: "assets/images/class-web.png",
      alt: "コンピュータ教室でWeb制作に取り組む学生",
      caption: "09:10 / FIRST PERIOD",
      label: "CREATE",
      title: "HTML・CSS・JavaScriptで、\n画面のアイデアを形にする。",
      description: "Web制作では、デザインだけでなく「誰に、何を、どう伝えるか」まで考えます。つくって、動かして、改善する授業です。",
      tags: ["# Web制作", "# 情報デザイン", "# 実習"],
    },
    lunch: {
      image: "assets/images/student-life.jpg",
      alt: "キャンパスのテーブルで会話をする学生",
      caption: "12:20 / LUNCH BREAK",
      label: "RELAX",
      title: "Cafe Rest 50で昼食。\n友だちとの会話も大切な時間。",
      description: "2限が終わったら昼休み。学食や学生ラウンジで、授業のこと、サークル、将来のことまで気軽に話します。",
      tags: ["# 学食", "# 友だち", "# 昼休み"],
    },
    afternoon: {
      image: "assets/images/seminar-workshop.png",
      alt: "付箋を使って議論するゼミの学生",
      caption: "13:00 / SEMINAR",
      label: "DISCUSS",
      title: "ゼミでは、答えを待たずに、\n自分たちで問いを深める。",
      description: "身近な課題を持ち寄り、調べ、話し合い、提案にまとめます。少人数だから、自分の考えを言葉にする機会が増えます。",
      tags: ["# ゼミ", "# グループワーク", "# 発表"],
    },
    evening: {
      image: "assets/images/group-study.jpg",
      alt: "明るいラウンジで資料を広げて学ぶ学生",
      caption: "17:50 / AFTER CLASS",
      label: "CONNECT",
      title: "授業後は、復習・相談・活動へ。\n自分のペースで一日を仕上げる。",
      description: "ラウンジで課題を進めたり、教員や友だちに相談したり。授業外の時間も、自分で選んで学びを広げられます。",
      tags: ["# 自習", "# 相談", "# キャンパス時間"],
    },
  };

  const dayButtons = $$(".day-button");
  const dayScene = $("#dayScene");

  const activateDay = (button) => {
    const data = dayData[button.dataset.day];
    if (!data || !dayScene) return;
    dayButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    $("#dayImage").src = data.image;
    $("#dayImage").alt = data.alt;
    $("#dayCaption").textContent = data.caption;
    $("#dayLabel").textContent = data.label;
    $("#dayTitle").innerHTML = data.title.replace("\n", "<br>");
    $("#dayDescription").textContent = data.description;
    $("#dayTags").innerHTML = data.tags.map((tag) => `<span>${tag}</span>`).join("");
    dayScene.setAttribute("aria-labelledby", button.id);
    dayScene.classList.remove("is-updating");
    requestAnimationFrame(() => dayScene.classList.add("is-updating"));
    window.setTimeout(() => dayScene.classList.remove("is-updating"), 600);
  };

  dayButtons.forEach((button) => button.addEventListener("click", () => activateDay(button)));
  enableArrowNavigation(dayButtons, activateDay);

  // Department fields
  const fieldData = {
    management: {
      number: "01",
      english: "MANAGEMENT",
      title: "「売れる仕組み」を考え、\n人とチームを動かす。",
      description: "商品企画、ブランド、マーケティング、プロジェクト運営。相手のニーズを読み、アイデアを実現する道筋を考えます。",
      course: "マーケティング論",
      courseNote: "「作ったものを売る」から「売れるものを考える」へ。",
      image: "assets/images/class-marketing.png",
      alt: "教室でマーケティングの発表をする学生",
    },
    accounting: {
      number: "02",
      english: "ACCOUNTING",
      title: "数字を「情報」として読み、\n事業の次の一手を考える。",
      description: "売上、コスト、利益、資金の流れ。数字を計算するだけでなく、経営判断に役立つ意味へ変換します。",
      course: "原価計算",
      courseNote: "コストを集計し、事業をより良くする情報として活用。",
      image: "assets/images/class-accounting.png",
      alt: "電卓と資料を使って会計データを確認する様子",
    },
    information: {
      number: "03",
      english: "INFORMATION",
      title: "Webとデータを使い、\nアイデアを動く仕組みにする。",
      description: "Web制作、アプリケーション、情報システム設計、デジタル表現。使う人を想像しながら、技術で価値を形にします。",
      course: "Web制作 / 情報システム設計",
      courseNote: "HTML・CSS・JavaScriptから、設計技法まで実践的に学ぶ。",
      image: "assets/images/class-web.png",
      alt: "コンピュータ教室でWebページを制作する学生",
    },
  };

  const fieldButtons = $$(".field-button");
  const fieldDetail = $("#fieldDetail");

  const activateField = (button) => {
    const data = fieldData[button.dataset.field];
    if (!data || !fieldDetail) return;
    fieldButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    $("#fieldImage").src = data.image;
    $("#fieldImage").alt = data.alt;
    $("#fieldLargeNumber").textContent = data.number;
    $("#fieldEnglish").textContent = data.english;
    $("#fieldTitle").innerHTML = data.title.replace("\n", "<br>");
    $("#fieldDescription").textContent = data.description;
    $("#fieldCourse").textContent = data.course;
    $("#fieldCourseNote").textContent = data.courseNote;
    fieldDetail.setAttribute("aria-labelledby", button.id);
    fieldDetail.classList.remove("is-updating");
    requestAnimationFrame(() => fieldDetail.classList.add("is-updating"));
    window.setTimeout(() => fieldDetail.classList.remove("is-updating"), 600);
  };

  fieldButtons.forEach((button) => button.addEventListener("click", () => activateField(button)));
  enableArrowNavigation(fieldButtons, activateField);

  // Project carousel
  const projectTrack = $("#projectTrack");
  const projectCards = $$(".project-card");
  const projectPrev = $("#projectPrev");
  const projectNext = $("#projectNext");
  const projectCurrent = $("#projectCurrent");
  let projectIndex = 0;
  let pointerStartX = null;

  const getCarouselMetrics = () => {
    if (!projectTrack || projectCards.length === 0) return { step: 0, visible: 1, max: 0 };
    const cardWidth = projectCards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(projectTrack).gap) || 0;
    const viewportWidth = projectTrack.parentElement.getBoundingClientRect().width;
    const visible = Math.max(1, Math.floor((viewportWidth + gap) / (cardWidth + gap)));
    return {
      step: cardWidth + gap,
      visible,
      max: Math.max(0, projectCards.length - visible),
    };
  };

  const updateCarousel = () => {
    if (!projectTrack) return;
    const metrics = getCarouselMetrics();
    projectIndex = Math.min(metrics.max, Math.max(0, projectIndex));
    projectTrack.style.transform = `translateX(${-projectIndex * metrics.step}px)`;
    projectPrev.disabled = projectIndex === 0;
    projectNext.disabled = projectIndex >= metrics.max;
    projectCurrent.textContent = String(projectIndex + 1).padStart(2, "0");
  };

  projectPrev?.addEventListener("click", () => {
    projectIndex -= 1;
    updateCarousel();
  });

  projectNext?.addEventListener("click", () => {
    projectIndex += 1;
    updateCarousel();
  });

  projectTrack?.addEventListener("pointerdown", (event) => {
    pointerStartX = event.clientX;
    projectTrack.setPointerCapture?.(event.pointerId);
  });

  projectTrack?.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const delta = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(delta) < 50) return;
    projectIndex += delta < 0 ? 1 : -1;
    updateCarousel();
  });

  projectTrack?.addEventListener("pointercancel", () => {
    pointerStartX = null;
  });

  updateCarousel();
  window.addEventListener("resize", updateCarousel);

  // Fit check quiz
  const quizQuestions = [
    {
      kicker: "どちらの瞬間にワクワクする？",
      question: "新しいサービスのアイデアを考えるとき",
      options: [
        {
          key: "management",
          label: "A",
          title: "人が使いたくなる理由を考える",
          note: "相手の気持ちや市場を想像する",
        },
        {
          key: "information",
          label: "B",
          title: "まず動くものをつくってみる",
          note: "画面や仕組みを試作する",
        },
      ],
    },
    {
      kicker: "データを見たとき、気になるのは？",
      question: "売上やアンケート結果が並んでいたら",
      options: [
        {
          key: "accounting",
          label: "A",
          title: "数字の変化と理由を読み解く",
          note: "利益やコスト、傾向を確かめる",
        },
        {
          key: "management",
          label: "B",
          title: "次にどんな企画をするか考える",
          note: "人の行動につながる作戦を立てる",
        },
      ],
    },
    {
      kicker: "課題を解決するとき、先にしたいのは？",
      question: "チームで一つの問題に取り組むなら",
      options: [
        {
          key: "information",
          label: "A",
          title: "使いやすい仕組みを設計する",
          note: "操作や情報の流れを組み立てる",
        },
        {
          key: "accounting",
          label: "B",
          title: "条件と数字を整理して判断する",
          note: "実現できる方法を根拠から考える",
        },
      ],
    },
  ];

  const quizResults = {
    management: {
      icon: "M",
      title: "企画プロデューサータイプ",
      description: "人の気持ちや社会の変化から、サービスの魅力を考えるのが得意。経営・マーケティングの学びで力が伸びそうです。",
      course: "マーケティング論 / プロジェクト演習",
    },
    accounting: {
      icon: "A",
      title: "ビジネスアナリストタイプ",
      description: "数字や条件を落ち着いて整理し、より良い判断につなげるのが得意。会計・ファイナンスの学びが向いています。",
      course: "原価計算 / 会計・ファイナンス分野",
    },
    information: {
      icon: "I",
      title: "デジタルクリエイタータイプ",
      description: "アイデアを画面や仕組みにして、実際に試すことが好き。情報デザイン・Web・システムの学びで成長できそうです。",
      course: "Web制作 / 情報システム設計",
    },
  };

  const quizStage = $("#quizStage");
  const quizResult = $("#quizResult");
  const quizStepLabel = $("#quizStepLabel");
  const quizProgressBar = $("#quizProgressBar");
  const quizOptions = $("#quizOptions");
  let quizStep = 0;
  let lastQuizAnswer = "management";
  let quizScores = { management: 0, accounting: 0, information: 0 };

  const renderQuizQuestion = () => {
    const question = quizQuestions[quizStep];
    if (!question) return;
    quizStepLabel.textContent = `QUESTION ${quizStep + 1} / ${quizQuestions.length}`;
    quizProgressBar.style.width = `${((quizStep + 1) / quizQuestions.length) * 100}%`;
    $(".quiz-kicker", quizStage).textContent = question.kicker;
    $("#quizQuestion").textContent = question.question;
    quizOptions.innerHTML = question.options
      .map(
        (option) => `
          <button type="button" data-answer="${option.key}">
            <span>${option.label}</span>
            <strong>${option.title}</strong>
            <small>${option.note}</small>
          </button>
        `
      )
      .join("");

    $$("button", quizOptions).forEach((button) => {
      button.addEventListener("click", () => handleQuizAnswer(button.dataset.answer));
    });

    quizStage.classList.remove("is-updating");
    requestAnimationFrame(() => quizStage.classList.add("is-updating"));
    window.setTimeout(() => quizStage.classList.remove("is-updating"), 500);
  };

  const showQuizResult = () => {
    const maxScore = Math.max(...Object.values(quizScores));
    const tied = Object.keys(quizScores).filter((key) => quizScores[key] === maxScore);
    const resultKey = tied.includes(lastQuizAnswer) ? lastQuizAnswer : tied[0];
    const result = quizResults[resultKey];

    quizStage.hidden = true;
    quizResult.hidden = false;
    quizStepLabel.textContent = "RESULT";
    quizProgressBar.style.width = "100%";
    $("#resultIcon").textContent = result.icon;
    $("#resultTitle").textContent = result.title;
    $("#resultDescription").textContent = result.description;
    $("#resultCourse").textContent = result.course;
    quizResult.classList.remove("is-entering");
    requestAnimationFrame(() => quizResult.classList.add("is-entering"));
  };

  const handleQuizAnswer = (answer) => {
    if (!(answer in quizScores)) return;
    quizScores[answer] += 1;
    lastQuizAnswer = answer;
    quizStep += 1;
    if (quizStep >= quizQuestions.length) {
      showQuizResult();
    } else {
      renderQuizQuestion();
    }
  };

  $("#restartQuiz")?.addEventListener("click", () => {
    quizStep = 0;
    lastQuizAnswer = "management";
    quizScores = { management: 0, accounting: 0, information: 0 };
    quizResult.hidden = true;
    quizStage.hidden = false;
    renderQuizQuestion();
  });

  renderQuizQuestion();
})();
