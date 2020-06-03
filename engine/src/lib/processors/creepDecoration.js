import { Sprite, Container } from 'pixi.js';
import { AlphaTo, Spawn, Repeat, Sequence } from '../actions';
import { ANIMATIONS } from '../decorations';

export default (params) => {
    const {
        logger,
        stage: { actionManager },
        rootContainer,
        scope,
        state,
        payload: {
            parentId,
        } = {},
        world: {
            decorations = [],
            layers,
        },
    } = params;
    const parent = parentId ? scope[parentId] : rootContainer;
    if (!parent) {
        logger.warn('No parent available with id', parentId);
        return;
    }

    decorations.forEach((i) => {
        if (i.decoration.type !== 'creep' || state.user !== `${i.user}` || !(new RegExp(i.nameRegex).test(state.name))) {
            return;
        }

        const container = new Container();
        if (i.syncRotate) {
            parent.addChild(container);
        } else {
            rootContainer.addChildAt(container, 0);
        }

        const sprite = Sprite.fromImage(i.decoration.url);
        Object.assign(sprite, {
            // blendMode: i.lighting ? 1 : 0,
            width: i.width,
            height: i.height,
            anchor: { x: 0.5, y: 0.5 },
            parentLayer: i.position === 'below' ? layers.objects : layers.effects,
            zIndex: 1,
        });
        if (i.alpha) {
            sprite.alpha = i.alpha;
        }
        if (i.color) {
            sprite.tint = parseInt(i.color.substring(1), 16);
        }
        container.addChild(sprite);

        if (i.lighting) {
            const lighting = Sprite.fromImage(i.decoration.url);
            Object.assign(lighting, {
                width: i.width,
                height: i.height,
                anchor: { x: 0.5, y: 0.5 },
                parentLayer: layers.lighting,
            });
            container.addChild(lighting);
        }
        if (i.alpha) {
            container.alpha = i.alpha;
        }
        if (i.animation) {
            const action = new Repeat(new Sequence(
                ANIMATIONS[i.animation].map(step => new Spawn([
                    new AlphaTo(step[0], step[1]),
                ]))));
            actionManager.runAction(container, action);
        }
    });
};
