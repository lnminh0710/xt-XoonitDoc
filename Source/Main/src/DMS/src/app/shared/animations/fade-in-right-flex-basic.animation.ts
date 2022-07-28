import { animate, style, transition, trigger } from '@angular/animations';

export function fadeInRightFlexBasisAnimation(duration: number) {
    return trigger('fadeInRightFlexBasis', [
        transition(':enter', [
            style({
                'flex-basis': '0px',
                opacity: 0,
            }),
            animate(
                `${duration}ms cubic-bezier(0.35, 0, 0.25, 1)`,
                style({
                    'flex-basis': '*',
                    opacity: 1,
                }),
            ),
        ]),
    ]);
}

export const fadeInRightFlexBasis = trigger('fadeInRightFlexBasis', [
    transition(
        ':enter',
        [
            style({
                flex: '0 0  calc(0% - 0px)',
            }),
            animate(
                '400ms cubic-bezier(0.35, 0, 0.25, 1)',
                style({
                    flex: '0 0  calc({{basis}}% - 2.5px)',
                }),
            ),
        ],
        { params: { basis: 100 } },
    ),
]);

export const fadeInRightFlexBasis400ms = fadeInRightFlexBasisAnimation(400);
