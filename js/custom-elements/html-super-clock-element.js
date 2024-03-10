//todo: 動作検証。特に時間の正確性

import { HTMLAttrSpec, HTMLAttrVal, HTMLAttrArray, HTMLAttrBigInt, HTMLAttrBool, HTMLAttrBStr, HTMLAttrFunc, HTMLAttrJSON, HTMLAttrNum, HTMLAttrStr, HTMLAttrSymbol, HTMLAttrUndefined, HTMLAttrElement, HTMLAttrSelector, HTMLAttrElementId } from './html-attr-spec.js';
import { HTMLAttributesLocker, HTMLMutationEmitter, HTMLRootElement } from './html-root-element.js';
import { HTMLEnumValuesElement, HTMLRegExpElement, HTMLValueElement, HTMLValueBoolElement, HTMLValueIntElement, HTMLValueFloatElement, HTMLValueNodesElement, HTMLValueJSONElement, HTMLValueDateElement } from './html-enum-values.js';

export class HTMLConversionElement extends HTMLRootElement {
	
	static {
		
		this.tagName = 'conversion-element';
		
	}
	
	static convert(value, converter) {
		
		return converter instanceof HTMLRegExpElement ?	converter?.of?.(value) :
																		typeof converter?.of === 'function' ?	converter?.of?.()?.[value] :
																															converter?.[value];
		
	}
	
	constructor() {
		
		super();
		
	}
	
	getConverter(key = 'v', defaultValue) {
		
		const converter = document.getElementById(this.getLockedAttribute(key));
		
		return converter instanceof HTMLEnumValuesElement ? converter : defaultValue;
		
	}
	
	convertChrs(value, converter = this.v) {
		
		return HTMLConversionElement.convert(value, converter);
		
	}
	
	
	get v() { return this.getConverter(); }
	set v(v) { this.setLockedAttribute('v', v); }
	
	
}
customElements.define(HTMLConversionElement.tagName, HTMLConversionElement);

export class HTMLPaddableElement extends HTMLConversionElement {
	
	static {
		
		this.tagName = 'paddable-element',
		
		this.$insertPosition = Symbol('HTMLPaddableElement.insertPosition'),
		this.$padNoop = Symbol('HTMLPaddableElement.padNoop'),
		this.$padNum = Symbol('HTMLPaddableElement.padNum'),
		this.$padStr = Symbol('HTMLPaddableElement.padStr'),
		
		this[this.$insertPosition] = 'beforeend',
		this[this.$padNoop] = false,
		this[this.$padNum] = 0,
		this[this.$padStr] = '0',
		
		this.position = {
			afterbegin: 'prepend',
			afterend: 'after',
			beforebegin: 'before',
			beforeend: 'append',
			replace: 'replaceChildren'
		};
		
	}
	
	// 第四引数 converter が指定されていると、仮にその値が undefined であっても、
	// 暗黙的に戻り値のオブジェクトに設定されたプロパティの値は element.prototype.append を通じて利用されることを想定して DocumentFragment に列挙される。
	static pad(str, pad = 0, padStr = '0', converter) {
		
		let k,v, signs;
		
		str =	isNaN(+str) ? str : '' + ((signs = (str = +str) ? str < 0 : Object.is(str, -0)) ? (str *= -1) : str),
		
		Number.isNaN(pad = parseInt(pad)) && (pad = 0),
		
		padStr = ''+padStr;
		
		const	l = str.length,
				padAbs = Math.abs(pad),
				repeatCount = l < padAbs ? parseInt((padAbs - l) / padStr.length) + 1 : 0,
				padded = repeatCount ? padStr.repeat(repeatCount) : '',
				output = {
								pad: repeatCount ? pad < 0 ? padded.slice(pad + l) : padded.slice(0, pad - l) : padded,
								sign: signs ? '-' : '',
								str
							};
		
		if (converter) {
			
			const { convert } = HTMLConversionElement;
			
			for (k in output) output[k] = convert(output[k], converter) ?? '';
			
		}
		
		if (arguments.length > 2) {
			
			let df;
			
			for (k in output)	(v = output[k]) instanceof DocumentFragment ||
										(
											df = new DocumentFragment(),
											Array.isArray(v) ? df.append(...v) : df.append(''+v),
											output[k] =	df
										);
			
		}
		
		return output;
		
	}
	
	constructor() {
		
		super();
		
	}
	
	pad(
		str = this.textContent,
		num = this.padNum,
		padStr = this.padStr,
		pseudo = this.padPseudo,
		noop = this.padNoop,
		converter = this.v
	) {
		
		const	{ insertPosition } = this,
				result = HTMLPaddableElement.pad(str, num, padStr, converter),
				{ pad, sign } = result;
		let k;
		
		str = result.str,
		
		pseudo ?
			(
				result.altered = str,
				noop ||	(
								this.dataset.padAttr = sign.textContent + pad.textContent,
								this.dataset.padSignedAttr = sign.textContent + str.textContent
							)
			) :
			(
				(result.altered = new DocumentFragment()).append(sign, pad, str),
				noop || this.insertAdjacent(insertPosition, result.altered)
			);
		
		return result;
		
	}
	
	insertAdjacent(position, ...nodes) {
		
		const p = HTMLPaddableElement.position[position];
		
		if (!p) throw new TypeError('An invalid value at the argument 1 "position".');
		
		this[p](...nodes);
		
	}
	
	get insertPosition() {
		
		return this.getLockedAttribute('insert-adjacent', this.constructor[HTMLPaddableElement.$insertPosition]);
		
	}
	set insertPosition(v) {
		
		this.setLockedAttribute('insert-adjacent', v);
		
	}
	get padNoop() {
		
		return this.getLockedAttribute('pad-noop', this.constructor[HTMLPaddableElement.$padNoop], true);
		
	}
	set padNoop(v) {
		
		this.setLockedAttribute('pad-noop', v, true);
		
	}
	get padNum() {
		
		const v = parseInt(this.getAttribute('pad'));
		
		return Number.isNaN(v) ? this.constructor[HTMLPaddableElement.$padNum] : v;
		
	}
	set padNum(v) {
		
		this.setAttribute('pad', v);
		
	}
	get padPsuedo() {
		
		return this.hasAttribute('pad-psuedo');
		
	}
	set padPsuedo(v) {
		
		this.toggleAttribute('pad-psuedo', !!v);
		
	}
	get padStr() {
		
		return this.hasAttribute('pad-str') ? this.getAttribute('pad-str') : this.constructor[HTMLPaddableElement.$padStr];
		
	}
	set padStr(v) {
		
		this.setAttribute('pad-str', v);
		
	}
	
}
customElements.define(HTMLPaddableElement.tagName, HTMLPaddableElement);

export class HTMLIntervalElement extends HTMLPaddableElement {
	
	static {
		
		this.tagName = 'interval-element',
		
		this.$delay = Symbol('HTMLIntervalElement.delay'),
		this.$elapse = Symbol('HTMLIntervalElement.elapse'),
		this.$epoch = Symbol('HTMLIntervalElement.epoch'),
		this.$from = Symbol('HTMLIntervalElement.from'),
		this.$interval = Symbol('HTMLIntervalElement.interval'),
		this.$last = Symbol('HTMLIntervalElement.last'),
		this.$run = Symbol('HTMLIntervalElement.run'),
		this.$runner = Symbol('HTMLIntervalElement.runner'),
		this.$running = Symbol('HTMLIntervalElement.running'),
		this.$stop = Symbol('HTMLIntervalElement.stop'),
		
		this[this.$delay] = 67,
		
		this[this.$running] = this.running;
		
	}
	
	static running() {
		
		const	{ $elapse, $epoch, $from, $last, $runner } = HTMLIntervalElement,
				runner = this[$runner],
				current = Date.now(),
				last = this[$last] ?? current,
				from = this[$from],
				gap = current - last,
				stops =	typeof runner !== 'function' ||
								runner.call(this, gap, this[$elapse] += gap, current, last, from, this[$epoch]) === false;
		
		stops ? this.stopInterval() : (this[$last] = current);
		
	}
	
	constructor() {
		
		super();
		
		const { $running } = HTMLIntervalElement;
		
		this[$running] = HTMLIntervalElement[$running].bind(this);
		
	}
	connectedCallback() {
		
		this.runInterval(!this.running);
		
	}
	
	runInterval(once) {
		
		const { $elapse, $epoch, $from, $interval, $last, $run, $running } = HTMLIntervalElement;
		
		this[$interval] || this?.[$run]?.() === false ||
			(
				this[$last] ?	(this[$from] = Date.now() - (this[$last] - this[$from])) :
									(this[$epoch] = this[$from] ??= Date.now(), this[$last] ??= Date.now(), this[$elapse] = 0),
				once ? this[$running]() : (this[$interval] ||= setInterval(this[$running], this.delay))
			);
		
	}
	pauseInterval() {
		
		const { $last } = HTMLIntervalElement;
		
		this.inerruptInterval(),
		
		this[$last] = Date.now();
		
	}
	stopInterval() {
		
		const { $elapse, $epoch, $from, $last } = HTMLIntervalElement;
		
		delete this[$elapse],
		delete this[$epoch],
		delete this[$last],
		delete this[$from],
		
		this.interruptInterval(true);
		
	}
	interruptInterval(stops) {
		
		const { $interval, $pause, $stop } = HTMLIntervalElement;
		
		clearInterval(this[$interval]),
		delete this[$interval],
		
		this?.[stops ? $stop : $pause]?.();
		
	}
	
	get delay() {
		
		return this.getLockedAttribute('delay', this.constructor[HTMLIntervalElement.$delay], HTMLAttrNum);
		
	}
	set delay(v) {
		
		this.setLockedAttribute('delay', v, HTMLAttrNum);
		
	}
	get running() {
		
		return this.getLockedAttribute('running', undefined, true);
		
	}
	set running(v) {
		
		this.setLockedAttribute('running', v, true);
		
	}
	
}
customElements.define(HTMLIntervalElement.tagName, HTMLIntervalElement);

export class HTMLClockWorkElement extends HTMLIntervalElement {
	
	static {
		
		this.tagName = 'clock-work',
		
		this.$cdp = Symbol('HTMLClockWorkElement.cdp'),
		this.$inheritance = Symbol('HTMLClockWorkElement.inheritance'),
		this.$multiplyer = Symbol('HTMLClockWorkElement.multiplyer'),
		this.$param = Symbol('HTMLClockWorkElement.param'),
		this.$period = Symbol('HTMLClockWorkElement.period'),
		this.$presetSpecSource = Symbol('HTMLClockWorkElement.presetSpecSource'),
		this.$setdata = Symbol('HTMLClockWorkElement.setdata'),
		this.$update = Symbol('HTMLClockWorkElement.update'),
		this.$tack = Symbol('HTMLClockWorkElement.tack'),
		
		this[this.$multiplyer] = 1,
		this[this.$pad] = 0,
		this[this.$padStr] = '0',
		this[this.$param] = 't',
		this[this.$period] = 0,
		this[this.$setdata] = 'cw-value',
		this[this.$tack] = 'tack',
		
		this.dn = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
		this.hn = [ 'AM', 'PM' ],
		
		this[HTMLPaddableElement.$insertPosition] = 'replace',
		
		this[HTMLAttributesLocker.$attribute] = {
			
			...this[HTMLAttributesLocker.$attributes],
			
			'allow-selector': HTMLAttributesLocker.$LOCKED,
			'block-selector': HTMLAttributesLocker.$LOCKED,
			'pad-noop': HTMLAttributesLocker.$LOCKED,
			'precedes-block': HTMLAttributesLocker.$LOCKED
			
		},
		
		this.cdp = this.defaultCdp = 'cw',
		
		// HTMLRootElement の静的プロパティ。
		// 以下のような記述子を指定すると、自動でシンボル $presetSpec を名前に持つ静的プロパティに、
		// 記述子を引数として HTMLAttrSpec.build() を実行した戻り値である、記述子と同じ構造を持つ HTMLAttrSpec のツリーが作成される。
		// この HTMLAttrSpec は、HTMLRootElement.prototype.spec が未指定であるか、
		// それが示す id に一致する <attr-spec> がドキュメント上に存在しない場合に既定値として使われる。
		// この記述子の実装は任意であるが、未指定だと、HTMLRootElement.prototype.spec の戻り値が存在しない時に属性値の指定が反映されない恐れがある。
		this.presetSpecSource = {
			
			asCamel: true,
			inherit: this.tagName,
			attr: {
				
				'data-$': { type: 'str', inheritProperty: 'param', key: 'param', defaultValue: 't' },
				'data-$-delay': { type: 'num', inheritProperty: 'delay', key: 'delay', defaultValue: 67 },
				'data-$-disabled-updated-event': { type: 'val', key: 'disabledUpdatedEvent', asBool: true },
				'data-$-disabled-setdata': { type: 'val', key: 'disabledSetdata', asBool: true },
				'data-$-disabled-tack': { type: 'val', key: 'disabledTack', asBool: true },
				'data-$-insert-adjacent': { type: 'str', inheritProperty: 'insertPosition', key: 'insertPosition', asBool: true },
				'data-$-invert': { type: 'str', inheritProperty: 'invert', key: 'invert', asBool: true },
				'data-$-floor': { type: 'val', inheritProperty: 'floor', key: 'floor', asBool: true },
				'data-$-mute': { type: 'val', inheritProperty: 'mute', key: 'mute', asBool: true },
				'data-$-pad': { type: 'num', inheritProperty: 'padNum', key: 'padNum', defaultValue: 0 },
				'data-$-pad-pseudo': { type: 'val', inheritProperty: 'padPseudo', key: 'padPseudo', asBool: true },
				'data-$-pad-str': { type: 'str', inheritProperty: 'padStr', key: 'padStr', defaultValue: '0' },
				'data-$-pause': { type: 'bstr', inheritProperty: 'pause', key: 'pause', asBool: true },
				'data-$-pause-selector': { type: 'selector', inheritProperty: 'pauseSelector', key: 'pauseSelector', asBool: true },
				'data-$-setdata':
					{ type: 'bstr', inheritProperty: 'setdata', key: 'setdata', defaultValue: [ this.$cdp, '-value' ] },
				'data-$-period': { type: 'str', inheritProperty: 'period', key: 'period' },
				'data-$-tack': { type: 'bstr', inheritProperty: 'tack', key: 'tack' },
				'data-$-time-zone': { type: 'str', inheritProperty: 'timeZone', key: 'timeZone', asBool: true },
				'data-$-values': { type: 'eid', key: 'values' }
				
			}
			
		},
		
		this.runningEventOption = { bubbles: true, cancelable: true };
		
		this.getAnimationOption = { subtree: true },
		
		this.rxDateTime = /(\d{1,4})-(\d{2})(\d{2})-(\d{2})(\d{2})-(\d{2})/;
		
	}
	static get cdp() {
		
		return this[HTMLClockWorkElement.$cdp] ?? this.defaultCdp;
		
	}
	static set cdp(v) {
		
		const { $cdp, $presetSpecSource } = HTMLClockWorkElement;
		
		this[$cdp] = ''+v, this.presetSpecSource = this[$presetSpecSource];
		
	}
	static get presetSpecSource() {
		
		return this[HTMLClockWorkElement.$presetSpecSource];
		
	}
	static set presetSpecSource(v) {
		
		if (v && typeof v === 'object') {
			
			const { $cdp, $inheritance, $presetSpecSource } = HTMLClockWorkElement, prefix = this.cdp;
			
			this[$presetSpecSource] = v,
			
			prefix &&	(
								this.presetSpec =	HTMLAttrSpec.modifySpecDescriptor
															(
																v,
																(k, v, descriptor) =>
																	k === 'inherit' && 'attr' in descriptor ?
																		// この行は、$presetSpecSource の最上位の記述子内のプロパティ
																		// inherit の値を置き換える処理
																		(descriptor[k] = this[$inheritance] || v, k) :
																		k.replace('$', prefix),
																(i, v, descriptor) => v === $cdp ? prefix : v
															)
							);
			
		}
		
	}
	
	// timing を対象の値に近い値（例えば data-clock="s" を指定した要素を含む時に、timing="1000" にするなど）にすると、
	// 処理時間などによって生じる誤差を丸め切れずに、時間の変更間隔が不正確になる場合がある。
	// 例えば timing="1000" で、1000,2000,3001,4002,... と、経過時間+処理時間で 1 ミリ秒ずつ増えるなど。
	// 開発ツールで対象の要素の CSS 変数 --clock-tack-time の変化を追い続けるとこの誤差を視覚的に確認し易い。
	// 実際のところ、対応不能かどうか判断しきれないところがあるが、現状は timing の値を 100 ミリ秒以下にすることでこの問題を回避できる。
	// 対応としては、この関数の実行時間を常に 0.0 秒 と仮定すれば次の時間までの厳密な差を得ることができるが（例えば一秒後は常に一秒後になる）、
	// 誤差は常に存在し続けるので、現実の時間と実行時間との差が一秒以上開いた時にこの時計の時間は二秒進むことになる。
	// これは例えば現実の時間が 2.3 秒の時、3.3 秒を一秒後にすれば、差は常に厳密に 1 秒だが、
	// 現実の時間の取得には常にラグが加算され続けるので、2.4,2.5,2.6... とミリ秒が増えてゆく。
	// その間、時計は常に 2 秒を示し続けるが、この誤差が 2 秒の範囲を超えた時、それまで 2 秒を示し続けていた時計は、
	// 2.0 + 0.9(誤差) + 1.0(次の秒) < 4, 2.0 + 1.0(誤差) + 1.0(次の秒) === 4 となり、2 秒の次の秒が 4 秒になる。
	
	static [HTMLIntervalElement.$runner](gap, elapse, current, lastRun, from, runAt) {
		
		const	{ runningEventOption } = HTMLClockWorkElement,
				{ constructor: { cdp }, epoch, multiplyer, style, updatedEvent } = this,
				now = new Date(epoch + elapse * multiplyer);
		let element, detail;
		
		for (element of this) {
			
			(detail = this.update(element, now, ...arguments)).hasOwnProperty('tack') &&
				(
					
					runningEventOption.detail = detail,
					element.dispatchEvent(new CustomEvent(cdp + '-tick', runningEventOption)),
					
					detail.isEpoch && element.dispatchEvent(new CustomEvent(cdp + '-tack', runningEventOption))
					
				),
			
			updatedEvent && detail.updated &&
				(
					runningEventOption.detail = detail,
					element.dispatchEvent(new CustomEvent(cdp + '-updated', runningEventOption))
				);
			
		}
		
	}
	
	static advanceDate(date = new Date(), param, timeZone) {
		
		const { getDateValue } = HTMLClockWorkElement;
		let y, index, monthNumber, advancedDateArgs, valuesKey, msp1 /* milliseconds per 1*/;
		
		switch (param = (param[0] === '-' ? param.slice(1) : param).trim().toLowerCase()) {
			
			case 'y':
			index = getDateValue(date, 'fullYear', timeZone),
			advancedDateArgs = [ (y = date.getFullYear()) + 1,0,1, 0,0,0,0 ],
			msp1 = (365 + !(y % 4 || !(y % 100) && y % 400)) * 86400000;
			break;
			
			case 'm':
			const m = date.getMonth(), nm = m === 11 ? 0 : m + 1;
			index = getDateValue(date, 'month', timeZone),
			monthNumber = m + 1,
			advancedDateArgs = [ (y = date.getFullYear()) + !nm,nm,1,0,0,0,0 ],
			msp1 = new Date(...advancedDateArgs).getTime() - new Date(y,m).getTime();
			break;
			
			case 'd':
			index = getDateValue(date, 'date', timeZone),
			advancedDateArgs = [
				new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					0,0,0,0
				).getTime() + (msp1 = 86400000)
			];
			break;
			
			case 'h':
			index = getDateValue(date, 'hours', timeZone);
			case 'h12':
			index ?? ((index = getDateValue(date, 'hours', timeZone)) > 11 && (index -= 12)),
			advancedDateArgs = [
				new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					date.getHours(),
					0,0,0
				).getTime() + (msp1 = 3600000)
			];
			break;
			
			case 'mi':
			index = getDateValue(date, 'minutes', timeZone),
			advancedDateArgs = [
				new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					date.getHours(),
					date.getMinutes(),
					0,0
				).getTime() + 60000
			],
			msp1 = 60000;
			break;
			
			case 's':
			index = getDateValue(date, 'seconds', timeZone),
			advancedDateArgs = [
				new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					date.getHours(),
					date.getMinutes(),
					date.getSeconds(),
					0
				).getTime() + (msp1 = 1000)
			];
			break;
			
			case 'ms':
			let i;
			advancedDateArgs = [ (i = (index = +(''+date.getTime()).slice(-3)) + (msp1 = 1)) > 999 ? 0 : i ];
			break;
			
			case 'dn':
			index = getDateValue(date, 'day', timeZone), valuesKey = 'vDN',
			advancedDateArgs = [
				new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					0,0,0,0
				).getTime() + (msp1 = 86400000)
			];
			break;
			
			case 'hn':
			const h = getDateValue(date, 'hours', timeZone);
			index = parseInt(h / 12), valuesKey = 'vHN',
			advancedDateArgs = [
				new Date(
					date.getFullYear(),
					date.getMonth(),
					date.getDate(),
					date.getHours(),
					0,0,0
				).getTime() + (msp1 = 43200000) - (h - (12 * index)) * 3600000
			];
			break;
			
			default:
			param = 't', advancedDateArgs = [ (index = date.getTime()) + 1 ];
			
		}
		
		return { advanced: new Date(...advancedDateArgs), index, monthNumber, msp1, param, valuesKey };
		
	}
	
	static getDateValue(date, valueName, timeZone) {
		
		return date['get' + (timeZone ? 'UTC' : '') + valueName[0].toUpperCase() + valueName.slice(1)]();
		
	}
	
	static getTimeValue(time, epoch = 0, defaultTime = epoch, floor) {
		
		const { rxDateTime } = HTMLClockWorkElement, { isNaN } = Number;
		let relative, dt;
		
		time =	(time = time?.trim?.() ?? time)?.[0] === '@' ?
						(
							(dt = rxDateTime.exec(time = time?.slice?.(1)?.trimStart?.())) &&
								(time = `${dt[1]}/${dt[2]}/${dt[3]} ${dt[4]}:${dt[5]}:${dt[6]}`),
							isNaN(time = Date.parse(time)) ? defaultTime : time
						) :
						(time ? (relative = time?.[0] === '+') ? time.slice(1) : (relative = time?.[0] === '-', time) : time),
		
		typeof time === 'number' || (time = time ? isNaN(time = parseInt(time)) ? defaultTime : time : defaultTime),
		
		relative &&	(time += epoch);
		
		return floor ? Math.floor(parseInt(time / 1000) * 1000) : time;
		
	}
	
	//static mutated({ detail: { removedNodes} }) {
	//	
	//	if (removedNodes) {
	//		
	//		const l = removedNodes.length, dsArrived = cdp + 'Paused';
	//		let i;
	//		
	//		i = -1;
	//		while (++i < l) delete removedNodes[i][dsArrived];
	//		
	//	}
	//	
	//}
	
	constructor() {
		
		super();
		
		const { $runner } = HTMLIntervalElement;
		
		this[$runner] = HTMLClockWorkElement[$runner].bind(this),
		
		//this.addEventListener('mutated', this.mutated = HTMLClockWorkElement.mutated.bind(this)),
		
		this.last = new WeakMap();
		
	}
	
	[HTMLRootElement.$iterates](element) {
		
		const closest = element.closest(this.constructor.tagName);
		
		return closest ? closest === this : element.getRootNode().host === this;
		
	}
	
	update(element, now, gap, elapse, current, lastRun, from, runAt) {
		
		if (!(element instanceof Element)) return;
		
		const	{ isNaN } = Number,
				{ $update, $updatedadvanceDate, advanceDate, getAnimationOption, getTimeValue } = HTMLClockWorkElement,
				{ constructor: { cdp }, last, multiplyer, epoch, period: globalPeriod } = this,
				{ classList, id, style } = element,
				specified = this.specify(element),
				{ disabledChanged, disabledSetdata, disabledTack, floor, invert, insertPosition, padNum, padPseudo, padStr, param, pause, pauseSelector, setdata, period: localPeriod, tack, timeZone, values } = specified,
				period = getTimeValue(localPeriod, epoch, globalPeriod, floor),
				nowTime = now.getTime(),
				timeZoneMsecs = now.getTimezoneOffset() * 60000,
				{ advanced, index, monthNumber, msp1, param: realParam, valuesKey } = advanceDate(now, param, timeZone),
				after = period <= nowTime,
				data =	{
								advanced,
								index,
								monthNumber,
								now,
								nowTime,
								param: realParam,
								period,
								rawParam: param,
								specified,
								target: element,
								timeZone,
								timeZoneMsecs,
								values,
								valuesKey
							},
				cdpPaused = cdp + '-paused',
				hasLast = last.has(element),
				lastUpdate = (hasLast && last.get(element)) || {},
				{ li, lp, lv } = lastUpdate,
				tick = hasLast && realParam === lp && index === li;
		let i,l,v, updated, pausedContent, isEpoch;
		
		lastUpdate.lp = realParam,
		
		after ?	element.hasAttribute(cdpPaused) ||
						(element.toggleAttribute(cdpPaused), isEpoch = true, pausedContent = v = pauseSelector ?? pause) :
					element.removeAttribute(cdpPaused),
		
		v ??= this?.[$update]?.(data) ?? -0,
		v = this.convertChrs(v, values ?? this?.[valuesKey || 'v' + realParam[0].toUpperCase() + realParam.slice(1)]) ?? v;
		
		if (!v || typeof v !== 'object') {
			
			!isNaN(+v) && invert !== false && ((invert !== '0' && invert[1] !== '0') || v === 0) &&
				(
					invert[0] === '-' ? (v = v ? v > 0 ? Math.abs(v) * -1 : v : -0) :
					invert[0] === '+' ? (v = v ? v < 0 ? Math.abs(v) : v : 0) :
					v ? (v *= -1) : (v = Object.is(v, 0) ? -0 : 0)
				),
			
			v = [ ...this.pad.call(element, v, padNum, padStr, padPseudo, !padPseudo, this.v).altered.childNodes ],
			
			i = -1, l = v.length;
			while (++i < l) v[i] instanceof Text && (v[i] = v[i].textContent);
			
		}
		
		v instanceof DocumentFragment && (v = v.childNodes);
		
		if (updated = hasLast && lv && typeof lv === 'object' && (l = v?.length) === lv?.length) {
			
			i = -1;
			while (++i < l && v[i] === lv[i]);
			updated = i === l;
			
		}
		
		const pausing = after && pause !== null && pause !== undefined,
				event =	{
								// period で操作された時間が epoch で設定された時間を超えた時に true を示す。旧 reaching
								after,
								as: specified.param,
								host: this,
								index,
								lastIndex: li,
								lastParam: lp,
								lastValue: lv,
								monthNumber,
								// after が false から true に切り替わった時にのみ true を示す。
								isEpoch,
								name: realParam,
								param: realParam,
								// 属性 pause が設定されている時に after が false から true に切り替わった時にのみ true を示す。旧 paused
								paused: isEpoch && pause !== null && pause !== undefined,
								// 属性 pause が設定されている時に after が true を示し続ける間 true を示す。旧 paused
								pausing,
								rawParam: param,
								target: element,
								value: v
							};
		
		if (!updated) {
			
			event.lastValue = lv, lastUpdate.lv = v;
			
			if (typeof v !== 'string' && typeof v[Symbol.iterator] === 'function') {
				
				const df = new DocumentFragment();
				let v0;
				
				i = -1, l = v.length;
				while (++i < l) df.append((v0 = v[i])?.cloneNode?.(true) ?? ''+v0);
				
				v = df;
				
			}
			
			if (v instanceof DocumentFragment) {
				
				const { convert } = HTMLConversionElement, { children } = v;
				let child;
				
				i = -1, l = children.length;
				while (++i < l) (child = children[i]).replaceWith
					(child instanceof HTMLEnumValuesElement ? convert(index, child) : child.cloneNode(true));
				
			}
			
			(!pausing || pausedContent !== undefined) &&
				!specified.mute && this.insertAdjacent.call(element, insertPosition, v),
			
			'disabledSetdata' in specified || setdata === false ||
				element.setAttribute('data-' + setdata, v?.textContent ?? v),
				
			event.updated = !specified.hasOwnProperty('disabledUpdatedEvent');
			
		}
		
		if (!tick && tack) {
			
			lastUpdate.li = index;
			
			const animes = element.getAnimations(getAnimationOption);
			let anime;
			
			i = -1, l = animes.length;
			while (++i < l) (anime = animes[i]).currentTime === null || (anime.cancel(), anime.play());
			
			!specified.hasOwnProperty('disabledTack') && tack &&
				(
					
					style.setProperty(
							'--' + cdp + '-' + tack + '-time',
							event.tackMS = (event.tack = (advanced.getTime() - nowTime) / multiplyer) + 'ms'
						),
					style.setProperty(
							'--' + cdp + '-' + tack + '-fixed-time',
							event.fixedTime = msp1 / multiplyer + 'ms'
						),
					
					id &&	(
								this.style.setProperty('--' + cdp + '-tack-time-' + id, event.tackMS),
								this.style.setProperty('--' + cdp + '-tack-fixed-time-' + id, event.fixedTime)
							)
					
				);
			
		}
		
		last.set(element, lastUpdate);
		
		return event;
	
	}
	
	getAttrTimeValue(attrName, epoch = this[HTMLIntervalElement.$epoch] ?? 0, defaultTime = epoch, floor = this.floor) {
		
		return	HTMLClockWorkElement.getTimeValue
						(this.getLockedAttribute(attrName, defaultTime), epoch, defaultTime, floor);
		
	}
	
	getValues(key, defaultValue) {
		
		return this.getConverter(key, defaultValue);
		
	}
	
	get updatedEvent() {
		
		return this.getLockedAttribute('updated-event', false, true);
	
	}
	set updatedEvent(v) {
		
		this.setLockedAttribute('updated-event', v, true);
		
	}
	get floor() {
		
		return this.getLockedAttribute('floor', false, true);
	
	}
	set floor(v) {
		
		this.setLockedAttribute('floor', v, true);
		
	}
	get invert() {
		
		return this.getLockedAttribute('invert', undefined, HTMLAttrBStr);
		
	}
	set invert(v) {
		
		return this.setLockedAttribute('invert', v);
		
	}
	get multiplyer() {
		
		return this.getLockedAttribute('multiplyer', this.constructor[HTMLClockWorkElement.$multiplyer], HTMLAttrNum);
		
	}
	set multiplyer(v) {
		
		this.setLockedAttribute('multiplyer', v, HTMLAttrNum);
	
	}
	get mute() {
		
		return this.getLockedAttribute('mute', false, true);
		
	}
	set mute(v) {
		
		this.setLockedAttribute('mute', v, true);
		
	}
	get epoch() {
		
		//return this.getAttrTimeValue('epoch');
		return this.getAttrTimeValue('epoch');
	}
	set epoch(v) {
		
		this.setLockedAttribute('epoch', v);
		
	}
	get padNum() {
		
		return this.getLockedAttribute('pad', this.constructor[HTMLClockWorkElement.$pad], HTMLAttrNum);
		
	}
	set padNum(v) {
		
		this.setLockedAttribute('pad', v, HTMLAttrNum);
	
	}
	get padStr() {
		
		return this.getLockedAttribute('pad-str', this.constructor[HTMLClockWorkElement.$padStr], HTMLAttrStr);
	
	}
	set padStr(v) {
		
		this.setLockedAttribute('pad-str', v, HTMLAttrStr);
		
	}
	get padPseudo() {
		
		return this.getLockedAttribute('pad-pseudo', false, true);
		
	}
	set padPseudo(v) {
		
		this.setLockedAttribute('pad-pseudo', v, true);
		
	}
	get param() {
		
		return this.getLockedAttribute('param', this.constructor[HTMLClockWorkElement.$param]).trim().toLowerCase();
		
	}
	set param(v) {
		
		this.setLockedAttribute('param', v);
		
	}
	get pause() {
		
		return this.getLockedAttribute('pause', undefined, HTMLAttrVal);
		
	}
	set pause(v) {
		
		this.setLockedAttribute('pause', v);
		
	}
	get pauseSelector() {
		
		return this.getLockedAttribute('pause-selector', undefined, HTMLAttrSelector);
		
	}
	set pauseSelector(v) {
		
		this.setLockedAttribute('pause-selector', v);
		
	}
	get period() {
		
		return this.getAttrTimeValue('period', this.epoch, this.constructor[HTMLClockWorkElement.$period]);
		
	}
	set period(v) {
		
		this.setLockedAttribute('period', v);
		
	}
	get setdata() {
		
		return this.getLockedAttribute('setdata', this.constructor[HTMLClockWorkElement.$setdata], HTMLAttrBStr);
		
	}
	set setdata(v) {
		
		this.setLockedAttribute('setdata', v);
		
	}
	get tack() {
		
		const v = this.getLockedAttribute('tack', undefined, HTMLAttrBStr);
		
		return v === false ? v : v || this.constructor[HTMLClockWorkElement.$tack];
		
	}
	set tack(v) {
		
		this.setLockedAttribute('tack', v);
		
	}
	get timeZone() {
		
		return this.hasAttribute('time-zone');
		
	}
	set timeZone(v) {
		
		this.setLockedAttribute('time-zone', v);
		
	}
	
	get vY() { return this.getValues('v-y'); }
	set vY(v) { this.setLockedAttribute('v-y', v); }
	get vM() { return this.getValues('v-m'); }
	set vM(v) { this.setLockedAttribute('v-m', v); }
	get vD() { return this.getValues('v-d'); }
	set vD(v) { this.setLockedAttribute('v-d', v); }
	
	get vDN() { return this.getValues('v-dn', HTMLSuperClockElement.dn); }
	set vDN(v) { this.setLockedAttribute('v-dn', v); }
	get vHN() { return this.getValues('v-hn', HTMLSuperClockElement.hn); }
	set vHN(v) { this.setLockedAttribute('v-hn', v); }
	get vH12() { return this.getValues('v-h12'); }
	set vH12(v) { this.setLockedAttribute('v-h12', v); }
	
	get vH() { return this.getValues('v-h'); }
	set vH(v) { this.setLockedAttribute('v-h', v); }
	get vMi() { return this.getValues('v-mi'); }
	set vMi(v) { this.setLockedAttribute('v-mi', v); }
	get vS() { return this.getValues('v-s'); }
	set vS(v) { this.setLockedAttribute('v-s', v); }
	get vMS() { return this.getValues('v-ms'); }
	set vMS(v) { this.setLockedAttribute('v-ms', v); }
	get vT() { return this.getValues('v-t'); }
	set vT(v) { this.setLockedAttribute('v-t', v); }
	
}
customElements.define(HTMLClockWorkElement.tagName, HTMLClockWorkElement);

export class HTMLSuperClockElement extends HTMLClockWorkElement {
	
	static {
		
		this.tagName = 'super-clock',
		
		this[HTMLRootElement.$iterator] = '[data-clock]',
		//this[HTMLRootElement.$iterator] = function () {
		//	
		//	return	[
		//					...(this.shadowRoot?.querySelectorAll?.(':not(super-clock) [data-clock]') ?? []),
		//					...this.querySelectorAll('[data-clock]')
		//				];
		//	
		//},
		
		this[HTMLClockWorkElement.$inheritance] = this.tagName,
		
		this.cdp = 'clock';
		
	}
	
	constructor() {
		
		super();
		
	}
	
	//[HTMLClockWorkElement.$update]({ index, monthNumber, param, values, valuesKey }) {
	[HTMLClockWorkElement.$update]({ index, monthNumber }) {
		
		//const	{ camelize } = HTMLAttributesLocker;
		
		//return this.convertChrs(index, values ?? this?.[valuesKey || 'v' + camelize(param)]) ?? monthNumber ?? index;
		return monthNumber ?? index;
		
	}
	
}
customElements.define(HTMLSuperClockElement.tagName, HTMLSuperClockElement);

export class HTMLSuperTimerElement extends HTMLClockWorkElement {
	
	static {
		
		this.tagName = 'super-timer',
		
		this[HTMLClockWorkElement.$period] = '+0',
		
		this[HTMLRootElement.$iterator] = '[data-timer]',
		
		this[HTMLClockWorkElement.$inheritance] = this.tagName,
		
		this.cdp = 'timer';
		
	}
	
	static getElapseMod(to = 0, from = new Date(), timeZone) {
		
		const { getElapseMod, getStaticDateMod } = HTMLSuperTimerElement;
		
		if ((to = getStaticDateMod(to, timeZone)).time > (from = getStaticDateMod(from, timeZone)).time) {
			
			const elapsed = getElapseMod(from.source, to.source, timeZone);
			let k;
			
			k = elapsed.to, elapsed.to = elapsed.from, elapsed.from = k;
			
			for (k in elapsed) typeof elapsed[k] === 'number' && (elapsed[k] = -elapsed[k]);
			
			return elapsed;
			
		}
		
		const monthly = [];
		let i, daysCount, mo, isLeap, time,y,d,m,h,mi,s,ms, _y,_m,_d,_h,_mi,_s,_ms;
		
		i = m = -1, y = 0,
		daysCount = _d = parseInt(parseInt((time = from.time - to.time) / 1000) / 86400),
		mo = from.m + 1, isLeap = !((_y = from.y) % 4 || !(_y % 100) && _y % 400), ++to.m;
		while ((daysCount -= monthly[i] ?? 0) >= 0) {
			
			monthly[++i] = --mo === 1 ? isLeap ? 29 : 28 : mo === 3 || mo === 5 || mo === 8 || mo === 10 ? 30 : 31,
			
			mo ||= 12,
			
			++m === 12 && (++y, m = 0, isLeap = !(--_y % 4 || !(_y % 100) && _y % 400));
			
		}
		
		m = (y ||= null) === null && !m ? null : m,
		d = (monthly[i] += daysCount) ? monthly[i] : m === null ? null : 0,
		
		h = from.h < to.h ? (24 - to.h) + from.h : from.h - to.h,
		mi = from.mi < to.mi ? (60 - to.mi) + from.mi : from.mi - to.mi,
		s = from.s < to.s ? ((60 - to.s) + (from.s)) : from.s - to.s,
		ms = from.ms < to.ms ? ((1000 - to.ms) + from.ms) : from.ms - to.ms,
		
		from.s < to.s && (_mi = --mi) < 0 && (mi = 60 + mi),
		from.mi <= to.mi && from.s <= to.s && (mi || _mi !== undefined) && (_h = --h) < 0 && (h = 24 + h),
		
		d === null && !h && (h = null, mi || (mi = null, s || (s = null, ms || (ms = null)))),
		
		_m = (((_y = y) || 0) * 12 + m) || null,
		_h = (((_d ||= null) || 0) * 24 + h) || null,
		_mi = ((_h || 0) * 60 + mi) || null,
		_s = ((_mi || 0) * 60 + s) || null,
		_ms = ((_s || 0) * 1000 + ms) || null;
		
		return { y, m, d, h, mi, s, ms, '-y': _y, '-m': _m, '-d': _d, '-h': _h, '-mi': _mi, '-s': _s, '-ms': _ms, direction: 1 };
		
	}
	static getStaticDateMod(source, timeZone) {
		
		source instanceof Date || (source = Array.isArray(source) ? new Date(...source) : new Date(source));
		
		const { getDateValue } = HTMLClockWorkElement, h = getDateValue(source, 'hours', timeZone);
		
		return	{
						
						source,
						
						y: getDateValue(source, 'fullYear', timeZone),
						m: getDateValue(source, 'month', timeZone),
						d: getDateValue(source, 'date', timeZone),
						h,
						mi: getDateValue(source, 'minutes', timeZone),
						s: getDateValue(source, 'seconds', timeZone),
						ms: getDateValue(source, 'milliseconds', timeZone),
						
						time: source.getTime()
						
					};
			
	}
	
	constructor() {
		
		super();
		
	}
	
	[HTMLClockWorkElement.$update]({ nowTime, period, rawParam, timeZone, timeZoneMsecs }) {
		
		const elapse = HTMLSuperTimerElement.getElapseMod(period - timeZoneMsecs, nowTime - timeZoneMsecs, timeZone);
		
		return elapse[rawParam] ?? 0 * elapse.direction
		
	}
	
}
customElements.define(HTMLSuperTimerElement.tagName, HTMLSuperTimerElement);

export class SuperClock extends HTMLElement {
	
	static {
		
		this.PAD = 0,
		this.PADSTR = '0',
		this.SETDATA = 'clock-value',
		this.SPEED = 1,
		this.TACK = 'tack',
		this.TIMING = 67,
		this.VALUE = 't',
		
		this.dn = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
		this.hn = [ 'AM', 'PM' ],
		
		this.rxDateTime = /(\d{1,4})-(\d{4})-(\d{4})-(\d{2})/;
		
		//this.observedAttributesValue = [ 'since' ];
		
	}
	//static get observedAttributes() {
	//	
	//	return this.observedAttributesValue;
	//	
	//}
	
	static getDiff(v) {
		
		// 以下のようにビット演算子で値を整数に変換すると、値が符号付き 32 ビットの範囲(-2147483648 から 2147483647) を超えると
		// ビット演算子の仕様に基づき正負が反転する。（例: 2147483648|0) そのため parseInt を用いて変換するように改修。
		//return v ? v[0] === '+' ? v.slice(1)|0 : v[0] === '-' ? -v.slice(1)|0 : v : v;
		
		return	(v = v?.trim?.() ?? '') ?	v[0] === '+' ? parseInt(v.slice(1)) :
														v[0] === '-' ? -parseInt(v.slice(1)) : v :
														v;
		
	}
	
	static getValues(id, defaultValue = []) {
		
		return document.getElementById(id)?.valueOf?.() ?? defaultValue;
		
	}
	
	static tick() {
		
		const	{ from, last, names, origin, reached, speed, style, ticked, timing } = this,
				clocks = this.querySelectorAll('[data-clock]'), cl = clocks.length,
				current = Date.now(), lag = this.tack ? (current - this.tack) - timing : 0,
				updates = [];
		let i,l,i0,i1,k,v,v0,v1, clock;
		
		this.tack && (this.accumulation += lag),
		i = i0 = -1, this.now = new Date(origin + (current - from) * speed), updates.length = 0;
		//this.now = new Date(origin + ((current - this.accumulation) - from) * speed);
		while (++i < cl)	(clock = clocks[i]).closest('super-clock') === this &&
									names.indexOf(v = this.write(clock).name) === -1 && (names[++i0] = v);
		
		i0 = -1;
		for (k in last) {
			
			if (names.indexOf(k) === -1) {
				
				delete last[k];
				
			} else if ('v' in (v = last[k])) {
				
				style.setProperty('--clock-tack-' + k, v.v),
				
				delete v.v, v.i = v.i0, delete v.i0,
				
				i = -1, l = (v0 = v.updates).length, i1 = (v1 = ticked[v.as] ??= []).length;
				while (++i < l) updates[++i0] = v1[i1++] = v0[i];
				
				v0.length = 0;
				
			}
			
		}
		
		for (k in ticked)	(v = ticked[k])?.length ?
			(this.dispatchEvent(new CustomEvent('tick-' + k, { detail: [ ...v ] })), v.length = 0) : delete ticked[k];
		
		names.length = 0,
		
		updates.length && this.dispatchEvent(new CustomEvent('tick', { detail: updates })),
		
		reached.length && (this.dispatchEvent(new CustomEvent('tack', { detail: [ ...reached ] })), reached.length = 0),
		
		this.tack = Date.now(), this.clock = setTimeout(this.tick, timing);
		
	}
	
	static getDateValue(date, valueName, timeZone) {
		
		return date['get' + (timeZone ? 'UTC' : '') + valueName[0].toUpperCase() + valueName.slice(1)]();
		
	}
	static getStaticDateMod(source, timeZone) {
		
		source instanceof Date || (source = Array.isArray(source) ? new Date(...source) : new Date(source));
		
		const { getDateValue } = SuperClock, h = getDateValue(source, 'hours', timeZone);
		
		return	{
						
						source,
						
						y: getDateValue(source, 'fullYear', timeZone),
						m: getDateValue(source, 'month', timeZone),
						d: getDateValue(source, 'date', timeZone),
						h,
						mi: getDateValue(source, 'minutes', timeZone),
						s: getDateValue(source, 'seconds', timeZone),
						ms: getDateValue(source, 'milliseconds', timeZone),
						
						time: source.getTime()
						
					};
			
	}
	static getElapseMod(to = 0, from = new Date(), timeZone) {
		
		const { getElapseMod, getStaticDateMod } = SuperClock;
		
		if ((to = getStaticDateMod(to, timeZone)).time > (from = getStaticDateMod(from, timeZone)).time) {
			
			const elapsed = getElapseMod(from.source, to.source, timeZone);
			let k;
			
			k = elapsed.to, elapsed.to = elapsed.from, elapsed.from = k;
			
			for (k in elapsed) typeof elapsed[k] === 'number' && (elapsed[k] = -elapsed[k]);
			
			return elapsed;
			
		}
		
		const monthly = [];
		let i, daysCount, mo, isLeap, time,y,d,m,h,mi,s,ms, _y,_m,_d,_h,_mi,_s,_ms;
		
		i = m = -1, y = 0,
		daysCount = _d = parseInt(parseInt((time = from.time - to.time) / 1000) / 86400),
		mo = from.m + 1, isLeap = !((_y = from.y) % 4 || !(_y % 100) && _y % 400), ++to.m;
		while ((daysCount -= monthly[i] ?? 0) >= 0) {
			
			monthly[++i] = --mo === 1 ? isLeap ? 29 : 28 : mo === 3 || mo === 5 || mo === 8 || mo === 10 ? 30 : 31,
			
			mo ||= 12,
			
			++m === 12 && (++y, m = 0, isLeap = !(--_y % 4 || !(_y % 100) && _y % 400));
			
		}
		
		m = (y ||= null) === null && !m ? null : m,
		d = (monthly[i] += daysCount) ? monthly[i] : m === null ? null : 0,
		
		h = from.h < to.h ? (24 - to.h) + from.h : from.h - to.h,
		mi = from.mi < to.mi ? (60 - to.mi) + from.mi : from.mi - to.mi,
		s = from.s < to.s ? ((60 - to.s) + (from.s)) : from.s - to.s,
		ms = from.ms < to.ms ? ((1000 - to.ms) + from.ms) : from.ms - to.ms,
		
		from.s < to.s && (_mi = --mi) < 0 && (mi = 60 + mi),
		from.mi <= to.mi && from.s <= to.s && (mi || _mi !== undefined) && (_h = --h) < 0 && (h = 24 + h),
		
		d === null && !h && (h = null, mi || (mi = null, s || (s = null, ms || (ms = null)))),
		
		_m = (((_y = y) || 0) * 12 + m) || null,
		_h = (((_d ||= null) || 0) * 24 + h) || null,
		_mi = ((_h || 0) * 60 + mi) || null,
		_s = ((_mi || 0) * 60 + s) || null,
		_ms = ((_s || 0) * 1000 + ms) || null;
		
		return { y, m, d, h, mi, s, ms, '-y': _y, '-m': _m, '-d': _d, '-h': _h, '-mi': _mi, '-s': _s, '-ms': _ms, direction: 1 };
		
	}
	
	constructor() {
		
		super(),
		
		this.tick = SuperClock.tick.bind(this),
		
		this.last = {}, this.ticked = {}, this.names = [], this.reached = [];
		
	}
	connectedCallback() {
		
		this.auto && this.start();
		
	}
	
	start() {
		
		this.accumulation = 0,
		this.from ??= Date.now(),
		
		this.clock || this.tick();
		
	}
	stop() {
		
		clearInterval(this.clock),
		delete this.clock;
		
	}
	
	fetchClockData(element) {
		
		const	{ isNaN } = Number,
				{ dataset } = element,
				{ asHTML, invert, pad, padPseudo, padStr, pause, since, tackName, timeZone, value } = this,
				padRaw = 'clockPad' in dataset ? parseInt(dataset.clockPad) : NaN,
				sinceRaw = 'clockSince' in dataset ?
					SuperClock.prototype.getAttrTimeValue.call(element, 'data-clock-since', this.origin, 0) : NaN;
		
		return	{
						asHTML: !('clockForceText' in dataset) && ('clockAsHTML' in dataset || asHTML),
						invert: 'clockInvert' in dataset || invert,
						pad: isNaN(padRaw) ? pad : padRaw,
						padPseudo: 'clockPadPseudo' in dataset || !!('clockDisabledPadPseudo' in dataset) || padPseudo,
						padStr: 'clockPadStr' in dataset ? dataset.clockPadStr : padStr,
						pause: 'clockPause' in dataset ? dataset.clockPause : pause,
						since: isNaN(sinceRaw) ? since : sinceRaw,
						tack: 'clockTack' in dataset ? dataset.clockTack : tackName,
						timeZone: 'clockTimeZone' in dataset || timeZone,
						value: 'clock' in dataset ? dataset.clock : value,
						values: 'clockValues' in dataset ? SuperClock.getValues(dataset.clockValues) : undefined
					};
		
	}
	
	write(clock) {
		
		if (!(clock instanceof Element)) return;
		
		const	{ isNaN } = Number,
				{ getDateValue, getElapseMod } = SuperClock,
				{ last, now, reached: reachedClocks } = this,
				{ asHTML, invert, pad, padPseudo, padStr, pause, since, tack, timeZone, value, values } =
					this.fetchClockData(clock),
				accumulates = value[0] === '-',
				slicePosition = accumulates && value[1] === '-' ? 2 : 1,
				padAbs = Math.abs(pad),
				sinceValue = isNaN(since) ? 0 : typeof since === 'number' ? since : (since?.getTime?.() ?? 0),
				nowTime = now.getTime(),
				timeZoneMsecs = now.getTimezoneOffset() * 60000;
		let i,i0,v,v0, from, remained,value0,vk, across, paused;
		
		switch (value0 = accumulates ? value.slice(slicePosition) : value) {
			
			case 'y':
			i = getDateValue(now, 'fullYear', timeZone),
			from = [ now.getFullYear() + 1,0,1, 0,0,0,0 ];
			break;
			
			case 'm':
			const m = now.getMonth(), nm = m === 11 ? 0 : m + 1;
			i = getDateValue(now, 'month', timeZone),
			i0 = m + 1,
			from = [ now.getFullYear() + !nm,nm,1,0,0,0,0 ];
			break;
			
			case 'd':
			i = getDateValue(now, 'date', timeZone),
			from = [
				new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					0,0,0,0
				).getTime() + 86400000
			];
			break;
			
			case 'h':
			i = getDateValue(now, 'hours', timeZone);
			case 'h12':
			i ?? ((i = getDateValue(now, 'hours', timeZone)) > 11 && (i -= 12)),
			from = [
				new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					now.getHours(),
					0,0,0
				).getTime() + 3600000
			];
			break;
			
			case 'mi':
			i = getDateValue(now, 'minutes', timeZone),
			from = [
				new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					now.getHours(),
					now.getMinutes(),
					0,0
				).getTime() + 60000
			];
			break;
			
			case 's':
			i = getDateValue(now, 'seconds', timeZone),
			from = [
				new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					now.getHours(),
					now.getMinutes(),
					now.getSeconds(),
					0
				).getTime() + 1000
			];
			break;
			
			case 'ms':
			from = [ (i = (i = +(''+nowTime).slice(-3) + 1) > 999 ? 0 : i) ];
			break;
			
			case 'dn':
			i = getDateValue(now, 'day', timeZone), vk = 'vDN',
			from = [
				new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					0,0,0,0
				).getTime() + 86400000
			];
			break;
			
			case 'hn':
			i = parseInt((v0 = getDateValue(now, 'hours', timeZone)) / 12), vk = 'vHN',
			from = [
				new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					now.getHours(),
					0,0,0
				).getTime() +
				43200000 - (v0 - (12 * i)) * 3600000
			];
			break;
			
			default:
			value0 = 't', from = [ (i = nowTime) + 1 ];
			
		}
		
		(across = sinceValue < nowTime) ?
			clock.classList.contains('clock-reached') ||
				(clock.classList.add('clock-reached'), paused = pause) :
			clock.classList.remove('clock-reached'),
		
		v = accumulates ?
			(
				i =	(v0 = getElapseMod(sinceValue - timeZoneMsecs, nowTime - timeZoneMsecs, timeZone))[value.slice(1)] ??
							0 * v0.direction
			) :
			values?.[i] ?? this?.[vk ||= 'v' + value0[0].toUpperCase() + value0.slice(1)]?.[i] ?? i0 ?? i,
		
		isNaN(+v) || (invert && (v ? (v *= -1) : (v = Object.is(v, 0) ? -0 : 0)));
		
		const reached = across && pause !== null,
				lastValue = last[value] ??= {},
				event = {
						as: lastValue.as = value0,
						clock,
						name: value,
						reached,
						paused: reached && paused !== undefined,
						pausing: reached,
						reached: across && paused !== undefined,
						reaching: across
					},
				signed = typeof v === 'number' && (v ? v < 0 : Object.is(v, -0)),
				pv = '' + (signed ? v * -1 : v);
		
		if (pad && padPseudo && padStr) {
			
			const	l = pv.length, cnt = l < padAbs ? parseInt((padAbs - l) / padStr.length) + 1 : 0,
					padded = cnt && padStr.repeat(cnt);
			
			clock.dataset.clockPadAttr = cnt ? pad < 0 ? padded.slice(pad + l) : padded.slice(0, pad - l) : '', v = pv;
			
		} else v = pad ? pv['pad' + (pad < 0 ? 'End' : 'Start')](padAbs, padStr) : pv;
		
		signed && (v = '-' + v),
		
		event.reached && (reachedClocks[reachedClocks.length] = event);
		
		if (lastValue.i !== i) {
			
			// timing を対象の値に近い値（例えば data-clock="s" を指定した要素を含む時に、timing="1000" にするなど）にすると、
			// 処理時間などによって生じる誤差を丸め切れずに、時間の変更間隔が不正確になる場合がある。
			// 例えば timing="1000" で、1000,2000,3001,4002,... と、経過時間+処理時間で 1 ミリ秒ずつ増えるなど。
			// 開発ツールで対象の要素の CSS 変数 --clock-tack-time の変化を追い続けるとこの誤差を視覚的に確認し易い。
			// 実際のところ、対応不能かどうか判断しきれないところがあるが、現状は timing の値を 100 ミリ秒以下にすることでこの問題を回避できる。
			// 対応としては、この関数の実行時間を常に 0.0 秒 と仮定すれば次の時間までの厳密な差を得ることができるが（例えば一秒後は常に一秒後になる）、
			// 誤差は常に存在し続けるので、現実の時間と実行時間との差が一秒以上開いた時にこの時計の時間は二秒進むことになる。
			// これは例えば現実の時間が 2.3 秒の時、3.3 秒を一秒後にすれば、差は常に厳密に 1 秒だが、
			// 現実の時間の取得には常にラグが加算され続けるので、2.4,2.5,2.6... とミリ秒が増えてゆく。
			// その間、時計は常に 2 秒を示し続けるが、この誤差が 2 秒の範囲を超えた時、それまで 2 秒を示し続けていた時計は、
			// 2.0 + 0.9(誤差) + 1.0(次の秒) < 4, 2.0 + 1.0(誤差) + 1.0(次の秒) === 4 となり、2 秒の次の秒が 4 秒になる。
			
			lastValue.i0 ||= i,
			
			(reached && paused === undefined) || this.mute || clock.dataset.clockMute ||
				(clock[asHTML ? 'innerHTML' : 'textContent'] = paused ?? v),
			
			clock.hasAttribute('data-clock-disabled-setdata') ||
				(
					clock.hasAttribute('data-clock-value') && (clock.dataset.clockValue = v),
					this.hasAttribute('setdata') && clock.setAttribute('data-' + this.setdata, v)
				),
			
			event.tack = (new Date(...from).getTime() - nowTime) * this.speed,
			
			lastValue.v ||= event.tack + 'ms',
			
			tack && !clock.hasAttribute('data-clock-disabled-tack') &&
				(
					clock.style.setProperty('--clock-' + tack + '-time', lastValue.v),
					clock.classList.remove(tack), void clock.offsetWidth, clock.classList.add(tack)
				),
			
			(lastValue.updates ||= [])[lastValue.updates.length] = event;
			
		}
		
		return event;
		
	}
	
	getValues(key, defaultValue) {
		
		return SuperClock.getValues(this.getAttribute('v-' + key), defaultValue);
		
	}
	
	getAttrTimeValue(name, value = this.from ?? 0, defaultValue = value) {
		
		const { constructor: { rxDateTime } } = this;
		let matched, attr, asDateString;
		
		attr = (asDateString = (attr = (attr = this.getAttribute(name))?.trim?.() ?? attr)?.[0] === '@') ?
			(
				(matched = rxDateTime.exec(attr = attr.slice(1).trimStart())) &&
					(attr = `${matched[1]}/${matched[2]}/${matched[3]} matched[4]:matched[5]:matched[6]`),
				Number.isNaN(attr = Date.parse(attr)) ? (asDateString = false, defaultValue) : attr
			) :
			(
				attr ?	attr[0] === '+' ? parseInt(attr.slice(1)) :
							attr[0] === '-' ? -parseInt(attr.slice(1)) : attr :
							attr
			),
		
		asDateString ||
			(
				attr =	typeof attr === 'number' ? value + attr :
								attr ? Number.isNaN(attr = parseInt(attr)) ? defaultValue : attr : defaultValue
			);
		
		return this.floor ? Math.floor(parseInt(attr / 1000) * 1000) : attr;
		
	}
	
	get asHTML() { return this.hasAttribute('as-html'); }
	set asHTML(v) { v || typeof v === 'string' ? this.setAttribute('as-html', v) : this.removeAttribute('as-html'); }
	
	get auto() { return this.hasAttribute('auto'); }
	set auto(v) {
		
		v || typeof v === 'string' ?
			this.clock || (this.start(), this.setAttribute('auto', '')) : this.removeAttribute('auto');
		
	}
	
	get tackName () { return this.hasAttribute('tack') && (this.getAttribute('tack') || SuperClock.TACK); }
	set tackName (v) { return v || typeof v === 'string' ? this.setAttribute('tack', v) : this.removeAttribute('tack'); }
	
	get floor() { return this.hasAttribute('floor'); }
	set floor(v) {
		
		v || typeof v === 'string' ? this.setAttribute('floor', v) : this.removeAttribute('floor');
		
	}
	
	get invert() { return this.hasAttribute('invert'); }
	set invert(v) { this.toggleAttribute('invert', !!v); }
	
	get mute() { return this.hasAttribute('mute'); }
	set mute(v) {
		v || typeof v === 'string' ? this.setAttribute('mute', v) : this.removeAttribute('mute');
	}
	
	get origin() {
		
		return this.getAttrTimeValue('origin');
		
	}
	set origin(v) { this.setAttribute('origin', v); }
	
	get pad() {
		
		const v = parseInt(this.getAttribute('pad'));
		
		return Number.isNaN(v) ? SuperClock.PAD : v;
		
	}
	set pad(v) { this.setAttribute('pad', v); }
	
	get padStr() { return this.hasAttribute('pad-str') ? this.getAttribute('pad-str') : SuperClock.PADSTR; }
	set padStr(v) { this.setAttribute('pad-str', v); }
	
	get padPseudo() { return this.hasAttribute('pad-pseudo'); }
	set padPseudo(v) {
		v || typeof v === 'string' ? this.setAttribute('pad-pseudo', v) : this.removeAttribute('pad-psuedo');
	}
	
	get pause() { return this.getAttribute('pause'); }
	set pause(v) { this.setAttribute('pause', v); }
	
	get setdata() { return this.getAttribute('setdata') || SuperClock.SETDATA; }
	set setdata(v) { this.setAttribute('setdata', v); }
	
	get since() {
		
		return this.getAttrTimeValue('since', this.origin, 0);
		
	}
	set since(v) { this.setAttribute('since', v); }
	
	get speed() {
		const v = this.getAttribute('speed') || SuperClock.SPEED, v0 = +v;
		return Number.isNaN(v0) ? SuperClock.SPEED : v0;
	}
	set speed(v) { this.setAttribute('speed', v); }
	
	get timeZone() { return this.hasAttribute('time-zone'); }
	set timeZone(v) { this.toggleAttribute('time-zone', !!v); }
	
	get timing() {
		
		const v = Math.abs(parseInt(this.getAttribute('timing')));
		
		return Number.isNaN(v) || !v ? SuperClock.TIMING : v;
		
	}
	set timing(v) { this.setAttribute('timing', v); }
	
	get vY() { return this.getValues('y'); }
	set vY(v) { this.setAttribute('v-y', v); }
	get vM() { return this.getValues('m'); }
	set vM(v) { this.setAttribute('v-m', v); }
	get vD() { return this.getValues('d'); }
	set vD(v) { this.setAttribute('v-d', v); }
	
	get vDN() { return this.getValues('dn', SuperClock.dn); }
	set vDN(v) { this.setAttribute('v-dn', v); }
	get vHN() { return this.getValues('hn', SuperClock.hn); }
	set vHN(v) { this.setAttribute('v-hn', v); }
	get vH12() { return this.getValues('h12'); }
	set vH12(v) { this.setAttribute('v-h12', v); }
	
	get vH() { return this.getValues('h'); }
	set vH(v) { this.setAttribute('v-h', v); }
	get vMi() { return this.getValues('mi'); }
	set vMi(v) { this.setAttribute('v-mi', v); }
	get vS() { return this.getValues('s'); }
	set vS(v) { this.setAttribute('v-s', v); }
	get vMS() { return this.getValues('ms'); }
	set vMS(v) { this.setAttribute('v-ms', v); }
	get vT() { return this.getValues('t'); }
	set vT(v) { this.setAttribute('v-t', v); }
	
	get value() { return (this.getAttribute('value') || SuperClock.VALUE).trim().toLowerCase(); }
	set value(v) { this.setAttribute('value', v); }
	
}
//customElements.define('super-clock', SuperClock);