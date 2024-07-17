const scenes = [
    {
        text: `田中優斗と佐藤和樹は都会の喧騒から逃れるため、山間の温泉旅館「霧の宿」にやってきた。夜が更けるにつれ、不穏な出来事が起こり始める。<br><br>到着した彼らは、旅館の女将に迎えられた。`,
        character: 'images/character1.png',
        choices: [
            { text: '部屋で休む', nextScene: 1 },
            { text: '温泉に行く', nextScene: 2 }
        ]
    },
    {
        text: `部屋で休んでいると、突然奇妙な音が聞こえた。<br><br>音の正体を確かめに行くか、無視して休むか。`,
        character: 'images/character2.png',
        choices: [
            { text: '音の正体を確かめに行く', nextScene: 3 },
            { text: '無視して休む', nextScene: 4 }
        ]
    },
    {
        text: `優斗と和樹は温泉へ向かった。温泉は露天風呂で、霧の中で入る温泉は格別だった。<br><br>風呂から上がると、また奇妙な音が聞こえてきた。`,
        character: 'images/character1.png',
        choices: [
            { text: '音の正体を確かめに行く', nextScene: 3 },
            { text: '無視して部屋に戻る', nextScene: 4 }
        ]
    },
    {
        text: `優斗たちは廊下に出て、音のする方向へ向かった。音は階下から聞こえてくる。慎重に足を進めると、神谷慎一が何かに怯えている様子を発見した。`,
        character: 'images/character2.png',
        choices: [
            { text: '女将に相談する', nextScene: 5 },
            { text: 'さらに調査を続ける', nextScene: 6 }
        ]
    },
    {
        text: `夜が更けるにつれ、霧が一層深まり、旅館の雰囲気は一層不気味さを増していった。優斗たちは新たな手がかりを基に、次なるステップを踏み出す準備を整える。`,
        character: 'images/character1.png',
        choices: [
            { text: '調査を続ける', nextScene: 6 },
            { text: '他の宿泊客と話す', nextScene: 7 }
        ]
    },
    {
        text: `神谷慎一と山田美咲と共に、霧の宿の謎を解明するための調査が続けられた。`,
        character: 'images/character2.png',
        choices: [
            { text: '庭園を調べる', nextScene: 8 },
            { text: '地下室を調べる', nextScene: 9 }
        ]
    },
    {
        text: `他の宿泊客の安全を確認し、鈴木夫婦の無事を確認した。`,
        character: 'images/character1.png',
        choices: [
            { text: '庭園を調べる', nextScene: 8 },
            { text: '地下室を調べる', nextScene: 9 }
        ]
    },
    {
        text: `庭園には古びた石碑と、その周りに奇妙な模様が彫られているのを発見した。模様を解読するために、古い文献や資料を調べ始める。`,
        character: 'images/character2.png',
        choices: [
            { text: '隠し通路に入る', nextScene: 10 },
            { text: '一度部屋に戻って準備を整える', nextScene: 11 }
        ]
    },
    {
        text: `地下室には古い資料や書物が山積みになっていた。彼らは分担して調査を進めるうちに、一つの古い手紙を発見した。手紙には、失踪事件の被害者と思われる女性の名前と、その最後の足取りが書かれていた。`,
        character: 'images/character1.png',
        choices: [
            { text: 'さらに調査を進める', nextScene: 10 },
            { text: '女将に報告する', nextScene: 11 }
        ]
    },
    {
        text: `隠し通路の先には、地下室が広がっていた。そこで古い資料や書物を発見し、失踪事件の真相に迫る手がかりを得た。`,
        character: 'images/character2.png',
        choices: [
            { text: '続ける', nextScene: 12 }
        ]
    },
    {
        text: `準備を整えた彼らは、隠し通路に入り、地下室に到達した。そこで重要な手がかりを見つけ、次のステップに進む決意をした。`,
        character: 'images/character1.png',
        choices: [
            { text: '続ける', nextScene: 12 }
        ]
    },
    {
        text: `次のシーンがここに続きます。`,
        character: 'images/character2.png',
        choices: [
            { text: '次へ', nextScene: 12 }
        ]
    }
];

let currentScene = 0;

function nextScene() {
    const scene = scenes[currentScene];
    document.getElementById('story-text').innerHTML = scene.text;
    const choicesDiv = document.getElementById('choices');
    choicesDiv.innerHTML = '';

    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.innerHTML = choice.text;
        button.onclick = () => {
            currentScene = choice.nextScene;
            nextScene();
        };
        choicesDiv.appendChild(button);
    });

    const characterImg = document.getElementById('character');
    if (scene.character) {
        characterImg.src = scene.character;
        characterImg.style.display = 'block';
    } else {
        characterImg.style.display = 'none';
    }

    document.getElementById('next-button').style.display = scene.choices.length === 0 ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    nextScene();
});
