class SimpleDiceRoller {

    static async Init(controls, html) {

        const diceRollbtn = $(
            `
            <li class="scene-control sdr-scene-control" data-control="simple-dice-roller" title="Simple Dice Roller">
                <i class="fas fa-dice-d20"></i>
            </li>
            `
        );
        const diceRollControls = `
            <ol class="sub-controls app control-tools sdr-sub-controls">
                <li id="SDRpopup" class="simple-dice-roller-popup control-tool">
                </li>
            </ol>
        `;

        html.find(".main-controls").append(diceRollbtn);
        html.append(diceRollControls);

        diceRollbtn[0].addEventListener('click', ev => this.PopupSheet(ev, html));

        this._createDiceTable(html);
    }

    static _createDiceTableHtmlOneCell(diceType, diceRoll, isLast) {

        let s = [];
        s.push('<li data-dice-type="', diceType, '" data-dice-roll="', diceRoll, '"');

        if (diceRoll == 1) {

            s.push(' class="sdr-col1">');

            if (diceType == 'f') {
                s.push('<i class="far fa-plus-square" "data-dice-type="', diceType, '" data-dice-roll="1"></i>');
            } else if (diceType == 100) {
                s.push('<i class="df-d10-10" data-dice-type="', diceType, '" data-dice-roll="1"></i>');
                s.push('<i class="df-d10-10" data-dice-type="', diceType, '" data-dice-roll="1"></i>');
            } else {
                s.push('<i class="df-d', diceType, '-', diceType, '" data-dice-type="', diceType, '" data-dice-roll="1"></i>');
            }

            if (diceType == 'f') {
                s.push(' Fate');
            } else {
                s.push(' d' + diceType);
            }

        } else if (isLast) {
            s.push(' class="sdr-lastcol">' + diceRoll);
        } else {
            s.push('>' + diceRoll);
        }
        s.push('</li>');

        return s.join('');
    }

    static _createDiceTableHtmlOneLine(diceType, maxDiceCount) {

        let s = [];

        s.push('<ul>');

        for (let i = 1; i <= maxDiceCount; ++i) {
            let isLast = (i == maxDiceCount);
            s.push(this._createDiceTableHtmlOneCell(diceType, i, isLast));
        }

        s.push('</ul>');

        return s.join('');
    }

    static _createDiceTableHtml(maxDiceCount, enableFateDice) {

        let s = [];

        s.push(this._createDiceTableHtmlOneLine(2, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(4, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(6, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(8, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(10, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(12, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(20, maxDiceCount));
        s.push(this._createDiceTableHtmlOneLine(100, maxDiceCount));
        if (enableFateDice) {
            s.push(this._createDiceTableHtmlOneLine('f', maxDiceCount));
        }


        return s.join('');
    }

    static _cachedMaxDiceCount = NaN;
    static _cachedEnableFateDice = false;

    static async _createDiceTable(html) {

        let maxDiceCount = parseInt(game.settings.get("simple-dice-roller", "maxDiceCount"), 10);

        let enableFateDice = Boolean(game.settings.get("simple-dice-roller", "enableFateDice"));

        if (isNaN(maxDiceCount) || (maxDiceCount < 1) || (maxDiceCount > 30)) {
            maxDiceCount = 5;
        }

        this._cachedMaxDiceCount = maxDiceCount;

        this._cachedEnableFateDice = enableFateDice;

        const tableContentsHtml = this._createDiceTableHtml(maxDiceCount, enableFateDice);

        const tableContents = $(tableContentsHtml);

        html.find('.simple-dice-roller-popup ul').remove();

        html.find('.simple-dice-roller-popup').append(tableContents);

        html.find('.simple-dice-roller-popup li').click(ev => this._rollDice(ev, html));
    }

    static async _rollDice(event, html) {

        var diceType = event.target.dataset.diceType;
        var diceRoll = event.target.dataset.diceRoll;

        var formula = diceRoll + "d" + diceType;

        let r = new Roll(formula);

        r.toMessage({
            user: game.user._id,
        })

        this._close(event, html);

    }

    static async PopupSheet(event, html) {
        //console.log("SDR | clicked");
        //canvas.stage.children.filter(layer => layer._active).forEach(layer => layer.deactivate());
        if (html.find('.sdr-scene-control').hasClass('active')) {
            this._close(event, html);
        } else {
            this._open(event, html);
        }
    }

    static async _close(event, html) {
        //console.log("SDR | closed");
        //html.find('#SDRpopup').hide();
        html.find('.sdr-scene-control').removeClass('active');
        html.find('.sdr-sub-controls').removeClass('active');
        html.find('.scene-control').first().addClass('active');

        event.stopPropagation();
    }

    static async _open(event, html) {
        //console.log("SDR | opened");
        this._createDiceTable(html);
        html.find('.scene-control').removeClass('active');
        html.find('.sub-controls').removeClass('active');
        //html.find('#SDRpopup').show();
        html.find('.sdr-scene-control').addClass('active');
        html.find('.sdr-sub-controls').addClass('active');
        event.stopPropagation();
    }


}

Hooks.on('renderSceneControls', (controls, html) => {
    console.log("SDR here", html);
    SimpleDiceRoller.Init(controls, html);
});

Hooks.once("init", () => {
    game.settings.register("simple-dice-roller", "maxDiceCount", {
        name: game.i18n.localize("simpleDiceRoller.maxDiceCount.name"),
        hint: game.i18n.localize("simpleDiceRoller.maxDiceCount.hint"),
        scope: "world",
        config: true,
        default: 8,
        type: Number
    });
    game.settings.register("simple-dice-roller", "enableFateDice", {
        name: game.i18n.localize("simpleDiceRoller.enableFateDice.name"),
        hint: game.i18n.localize("simpleDiceRoller.enableFateDice.hint"),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
});

console.log("SDR | Simple Dice Roller loaded");