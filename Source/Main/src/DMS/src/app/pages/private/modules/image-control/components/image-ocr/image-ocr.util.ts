import map from 'lodash-es/map';
import filter from 'lodash-es/filter';
import includes from 'lodash-es/includes';
import orderBy from 'lodash-es/orderBy';
import find from 'lodash-es/find';
import uniq from 'lodash-es/uniq';
import pick from 'lodash-es/pick';
import get from 'lodash-es/get';
import * as moment from 'moment';
import 'moment/min/locales';

import 'fabric';

import { CoordinateColorEnum } from '../../models/image.model';
import { IMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { MaterialControlType } from '@app/xoonit-share/processing-form/consts/material-control-type.enum';
import { ControlInputType } from '@xn-control/xn-dynamic-material-control/consts/control-input-type.enum';
import { InputMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/models/input-material-control-config.model';
import { Uti } from '@app/utilities';
declare const fabric: any;

const regexExcludeWords = [
    '.',
    '(',
    ')',
    '+',
    '*',
    '^',
    '$',
    '?',
    '|',
    '{',
    '}',
    '[',
    ']',
    '\\',
    '/',
    '_',
    '-',
    '~',
    '`',
];

const createRect = (canvas: any, option: object, _: any, declineAngle?: boolean) => {
    const rect = new fabric.Rect({
        originX: 'left',
        originY: 'top',
        strokeWidth: 1,
        stroke: CoordinateColorEnum.drawing,
        fill: 'transparent',
        hoverCursor: 'pointer',
        selectable: true,
        lockMovementX: true,
        lockMovementY: true,
        hasControls: false,
        ...option,
    });

    rect.on('selected', (o: any) => {
        _.deleteRect.emit({ rect: rect, callback: () => _.removeRect(rect.id), isRemove: true });
    });

    if (canvas) {
        canvas.add(rect);
    }
    const angle = _.angle;
    if (!declineAngle && angle) {
        const newPoint = _.parseLocationByAngle(_.canvas, rect.left, rect.top, angle);
        rect.top = newPoint.top;
        rect.left = newPoint.left;
        rect.angle += angle; //rotate each object buy the same angle
        rect.setCoords();
    }
    return rect;
};

const parseOcrData = (data: string) => {
    try {
        let dataOcr: any = JSON.parse(data);
        if (!dataOcr) {
            return;
        }
        dataOcr = dataOcr.text_annotations;
        let i = 1;
        dataOcr = map(dataOcr, (_d) => {
            const dataX = map(_d.bounding_poly.vertices, 'x');
            const dataY = map(_d.bounding_poly.vertices, 'y');

            _d.position = {
                p1: {
                    x: Math.min(...dataX),
                    y: Math.min(...dataY),
                },
                p2: {
                    x: Math.max(...dataX),
                    y: Math.min(...dataY),
                },
                p3: {
                    x: Math.max(...dataX),
                    y: Math.max(...dataY),
                },
                p4: {
                    x: Math.min(...dataX),
                    y: Math.max(...dataY),
                },
            };
            _d.k = i;
            i++;
            delete _d.bounding_poly;
            return _d;
        });
        return dataOcr;
    } catch (error) {
        return [];
    }
};
const getWidthHeightAfterRotate = (position: any, angle: number) => {
    let { width, height, left, top } = position;

    switch (angle) {
        case 0:
        case 360:
            break;
        case 90:
            left = left + width;
            break;
        case 180:
            left = left + width;
            top = top + height;
            break;
        case 270:
            top = top + height;
            break;
        default:
            break;
    }

    const rad = (angle * Math.PI) / 180,
        sin = Math.sin(rad),
        cos = Math.cos(rad);

    const newWidth = Math.abs(width * cos) + Math.abs(height * sin),
        newHeight = Math.abs(width * sin) + Math.abs(height * cos);
    position.width = newWidth;
    position.height = newHeight;
    position.top = top;
    position.left = left;

    return position;
};

function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

const generateRegexp = (firstWord: any, lastWord: any) => {
    if (new RegExp(regexExcludeWords.join('|\\')).test(lastWord)) {
        lastWord = escapeRegExp(lastWord);
    }
    if (new RegExp(regexExcludeWords.join('|\\')).test(firstWord)) {
        firstWord = escapeRegExp(firstWord);
    }

    return new RegExp(firstWord + '(.*)' + lastWord, 'g');
};

const findTheSentence = (fullWords: string, value: any) => {
    const fullWordsList = fullWords.split('<br />');
    const listResult = [];
    let listFilter = [];
    let firstWord = '';
    let lastWord = '';
    for (const key in value) {
        if (value.hasOwnProperty(key)) {
            const element = value[key];
            const regexFilter = generateRegexp(firstWord, element);
            const listTemp: any = filter(firstWord ? listFilter : fullWordsList, (_w) => _w.match(regexFilter));
            if (!firstWord) {
                firstWord = element;
            }
            const isLastItem = parseInt(key, 10) === value.length - 1;

            if (listTemp.length === 0) {
                if (lastWord === firstWord) {
                    listResult.push(firstWord);
                } else {
                    const regex = generateRegexp(firstWord, lastWord);
                    const word = listFilter[0].match(regex);
                    if (word) {
                        listResult.push(word[0]);
                    }
                }
                if (isLastItem) {
                    listResult.push(element);
                }
                listFilter = filter(fullWordsList, (_w) => includes(_w, element));
                firstWord = element;
                lastWord = element;
                continue;
            }
            if (isLastItem) {
                if (element === firstWord) {
                    listResult.push(firstWord);
                } else {
                    lastWord = isLastItem && firstWord === element ? '' : element;
                    const regex = generateRegexp(firstWord, lastWord);
                    const word = listTemp[0].match(regex);
                    if (word) {
                        listResult.push(word[0]);
                    }
                }
                continue;
            }

            lastWord = element;
            listFilter = listTemp;
        }
    }
    return listResult.join(' ');
};

const getTextFromRect = (rect: any, ocrData: any) => {
    const position = {
        p1: {
            x: rect.left,
            y: rect.top,
        },
        p2: {
            x: rect.left + rect.width,
            y: rect.top,
        },
        p3: {
            x: rect.left + rect.width,
            y: rect.top + rect.height,
        },
        p4: {
            x: rect.left,
            y: rect.top + rect.height,
        },
    };

    const result = filter(ocrData, (_d) => {
        const posiotionOcr = _d.position;
        if (
            position.p1.x < posiotionOcr.p1.x &&
            position.p1.y < posiotionOcr.p1.y &&
            position.p2.x > posiotionOcr.p2.x &&
            position.p2.y < posiotionOcr.p2.y &&
            position.p3.x > posiotionOcr.p3.x &&
            position.p3.y > posiotionOcr.p3.y
        ) {
            return true;
        }
        return false;
    });

    const value = findTheSentence(ocrData[0].description, map(result, 'description'));
    rect.Value = value;
    return {
        Value: value,
        Position: position,
        WordsCoordinates: [pick(rect, ['left', 'top', 'width', 'height', 'Value', 'fieldOnFocus', 'id'])],
    };
};

const getTextByPoint = (point: any, ocrData: any) => {
    const result = filter(ocrData, (_d) => {
        const posiotionOcr = _d.position;
        if (
            point.x > posiotionOcr.p1.x &&
            point.y > posiotionOcr.p1.y &&
            point.x < posiotionOcr.p2.x &&
            point.y > posiotionOcr.p2.y &&
            point.x < posiotionOcr.p3.x &&
            point.y < posiotionOcr.p3.y &&
            point.x > posiotionOcr.p4.x &&
            point.y < posiotionOcr.p4.y &&
            _d.k !== 1
        ) {
            return true;
        }
        return false;
    })[0];
    if (!result) {
        return;
    }
    return {
        Value: result.description,
        Position: result.position,
    };
};
const guid = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

/////////////////////////////////////////////
const findConsecutiveKey = (listData, keyNumber, plus, compareText) => {
    const result = [];
    for (const key in listData) {
        if (listData.hasOwnProperty(key)) {
            const element = listData[key];
            if (element.k === keyNumber + plus && includes(compareText, element.description)) {
                keyNumber += plus;
                result.push(element);
            } else {
                break;
            }
        }
    }
    return result;
};

const drawRectByAnnotations = (imageCanvas, validLine, validText, rectOption?) => {
    const WordsCoordinates = [];
    for (const key in validLine) {
        if (validLine.hasOwnProperty(key)) {
            const randomId: string = guid();
            const element = validLine[key];

            const left = element.position.p1.x;
            const top = element.position.p1.y;
            const width = element.position.p2.x - left;
            const height = element.position.p4.y - top;
            const rect = createRect(
                imageCanvas.canvas,
                {
                    ...rectOption,
                    ...imageCanvas.fieldFocus,
                    left,
                    top,
                    width,
                    height,
                    id: randomId,
                    Value: element.description,
                    // stroke: this.viewAllRect ? 'CoordinateColorEnum.selected' : 'CoordinateColorEnum.drawing',
                },
                imageCanvas,
            );
            WordsCoordinates.push(pick(rect, ['left', 'top', 'width', 'height', 'Value', 'fieldOnFocus', 'id']));
        }
    }

    imageCanvas.canvas.renderAll();

    return { WordsCoordinates, Value: validText };
};

const findValidWord = (validText, textLine, key, plus) => {
    if (validText.length === 1) {
        return uniq(validText);
    }
    const nextAnnotation = find(textLine, (_r) => _r.k === key + plus);
    if (!nextAnnotation) {
        return uniq(validText);
    }
    const newValidText = validText.filter((_ft: string) => includes(_ft, nextAnnotation.description));
    if (newValidText.length === 1) {
        return uniq(newValidText);
    } else if (newValidText.length === 0) {
        return uniq(validText);
    }
    return findValidWord(newValidText, textLine, key + plus, plus);
};

const getTheSentencesInLine = (imageCanvas, result, resultLine, fullText) => {
    const fullTextList = fullText.split('<br />');
    const keyNumber = result.k;
    let validText = findValidWord(fullTextList, resultLine, keyNumber - 1, 1);
    if (validText.length > 1) {
        validText = findValidWord(validText, resultLine, keyNumber + 1, -1);
    }
    if (validText.length > 1) {
        validText = validText.reduce((a, b) => (a.length <= b.length ? a : b));
    } else {
        validText = validText[0];
    }

    const underNumberList = orderBy(
        filter(resultLine, (_r) => _r.k < keyNumber),
        ['k'],
        ['desc'],
    );
    const overNumberList = filter(resultLine, (_r) => _r.k > keyNumber);
    const validLine = orderBy(
        [
            ...findConsecutiveKey(underNumberList, keyNumber, -1, validText),
            result,
            ...findConsecutiveKey(overNumberList, keyNumber, 1, validText),
        ],
        ['k'],
    );

    return drawRectByAnnotations(imageCanvas, validLine, validText);
};
const getWordsInline = (imageCanvas: any, point: any) => {
    const ocrData = imageCanvas.ocrData;
    const resultLine = filter(ocrData, (_d) => {
        const posiotionOcr = _d.position;
        if (point.y > posiotionOcr.p1.y && point.y < posiotionOcr.p4.y && _d.k !== 1) {
            return true;
        }
        return false;
    });
    const result = filter(ocrData, (_d) => {
        const posiotionOcr = _d.position;
        if (
            point.x > posiotionOcr.p1.x &&
            point.y > posiotionOcr.p1.y &&
            point.x < posiotionOcr.p2.x &&
            point.y > posiotionOcr.p2.y &&
            point.x < posiotionOcr.p3.x &&
            point.y < posiotionOcr.p3.y &&
            point.x > posiotionOcr.p4.x &&
            point.y < posiotionOcr.p4.y &&
            _d.k !== 1
        ) {
            return true;
        }
        return false;
    })[0];

    if (!result) {
        return;
    }
    return getTheSentencesInLine(imageCanvas, result, resultLine, ocrData[0].description);
};

const getNextWordByKey = (ocrData: any, searchValue: any, key: number, result: any[]) => {
    if (!searchValue) {
        return result;
    }
    let nextWord = find(ocrData, ['k', key + 1]);
    let description = nextWord.description.toLowerCase();
    if (includes(searchValue, description)) {
        result.push(nextWord);

        return getNextWordByKey(ocrData, searchValue.replace(description, '').trim(), key + 1, result);
    } else if (includes(description, searchValue)) {
        result.push(nextWord);
        return result;
    } else {
        return [];
    }
};

const findValidWordInOCR = (ocrData: any, searchValue: string) => {
    if (!searchValue.length) {
        return {
            result: [],
            searchValue,
        };
    }

    let result = map(
        filter(ocrData, (_d) => _d.description && includes(_d.description.toLowerCase(), searchValue) && _d.k !== 1),
    );

    if (result.length) {
        return { searchValue, result };
    }

    return findValidWordInOCR(ocrData, searchValue.substring(0, searchValue.length - 1));
};

const getPositionFromMultipleWord = (ocrData: any, searchValue: string) => {
    let firstWord = findValidWordInOCR(ocrData, searchValue.substring(0, searchValue.length - 1));
    let response = [];
    for (const key in firstWord.result) {
        if (firstWord.result.hasOwnProperty(key)) {
            const element = firstWord.result[key];

            // const centerPoint = {
            //     y: map(element.position, 'y').reduce((a, b) => a + b, 0) / 4,
            // };

            const lineValid = getNextWordByKey(
                ocrData,
                searchValue.replace(firstWord.searchValue, '').trim(),
                element.k,
                [],
            );
            if (lineValid.length) {
                response = response.concat([element, ...lineValid]);
            }
        }
    }
    return response;
};

const getPositionOfWord = (ocrData: any, searchValue: string) => {
    try {
        searchValue = searchValue.toLowerCase();
        let result = map(
            filter(
                ocrData,
                (_d) => _d.description && includes(_d.description.toLowerCase(), searchValue) && _d.k !== 1,
            ),
        );

        if (!result.length) {
            result = getPositionFromMultipleWord(ocrData, searchValue);
        }
        return result;
    } catch (error) {
        return [];
    }
};

const parseLocaleFromOCRData = (data: string) => {
    if (!data) return 'en';
    return get(JSON.parse(data), ['text_annotations', 0, 'locale']) || 'en';
};

const _convertMonth = (value, locale) => {
    const regex = new RegExp(`[\\d\\s${regexExcludeWords.join('\\')}&!#%@\'\"]`, 'g');
    const month = value.replace(regex, '');
    if (!month) return value;

    moment.locale(locale);
    const monthParse = moment.localeData().monthsParse(month, 'MM', true);
    if (typeof monthParse !== 'number') return value;
    return value.replace(month, monthParse + 1);
};

const _parseOcrTextToNumber = (value: string) => {
    if (!value) return '0';
    value = value.trim();
    value = value.replace(/'/g, ''); // 1'000
    const checkSeparateRealsNumberByDot = new RegExp(
        /^[\d]{1,3}(?:[\d]*(?:[.][\d]{0,})?|(?:,[\d]{3})*(?:\.[\d]{0,})?)$/,
        'g',
    ); // 10.000,00

    const checkSeparateRealsNumberByComma = new RegExp(
        /^[\d]{1,3}(?:[\d]*(?:[,][\d]{0,})?|(?:\.[\d]{3})*(?:,[\d]{0,})?)$/,
        'g',
    ); // 10,000.00
    if (checkSeparateRealsNumberByComma.test(value)) {
        // 10.000,00
        value = value.replace(/\./g, '');
        value = value.replace(/,/g, '.');
    } else if (checkSeparateRealsNumberByDot.test(value)) {
        // 10,000.00
        value = value.replace(/,/g, '');
    } else {
        value = '0';
    }

    value = Uti.transformNumberHasDecimal(value, 2);
    return value;
};

const _parseValueOfEsPNrField = (value: string) => {
    return value.replace(/(?<=\d) +(?=\d)/g, '');
};

const convertDataOCR = (config: IMaterialControlConfig, value: string, locale: string) => {
    switch (config.type) {
        case MaterialControlType.INPUT:
            if (config['inputType'] === ControlInputType.NUMBER) {
                return _parseOcrTextToNumber(value);
            }

            // special case for ESRNr field
            if (config.formControlName === 'ESRNr') {
                return _parseValueOfEsPNrField(value);
            }

            return value + ' ';

        case MaterialControlType.DATEPICKER:
            let _moment = moment(value, 'DD.MM.YYYY');

            if (!_moment.isValid()) {
                value = _convertMonth(value, locale);
                moment.locale('en');
                _moment = moment(value, 'DD.MM.YYYY');
            }

            if (_moment.isValid()) {
                return _moment.format('DD.MM.YYYY');
            }

            const dateStr = new Date(value).toLocaleDateString('en-EN');
            return moment(dateStr).format('DD.MM.YYYY');

        default:
            return value + ' ';
    }
};

export {
    convertDataOCR,
    createRect,
    getPositionOfWord,
    getTextFromRect,
    getTextByPoint,
    getWidthHeightAfterRotate,
    getWordsInline,
    guid,
    parseOcrData,
    parseLocaleFromOCRData,
};
