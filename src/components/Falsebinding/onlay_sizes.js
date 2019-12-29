export default function onlay_sizes({imposts, consts, PointText}) {
  for(const onlay of imposts) {
    const {generatrix: gen} = onlay;
    const position = gen.getNearestPoint(onlay.interiorPoint());
    const offset = gen.getOffsetOf(position);

    const text = new PointText({
      parent: onlay,
      guide: true,
      justification: 'center',
      fillColor: 'black',
      fontFamily: consts.font_family,
      fontSize: consts.font_size,
      content: onlay.length.round(),
      position,
    });
    text.translate(gen.getNormalAt(offset).multiply((consts.font_size + onlay.nom.width) / 2));
    text.rotate(gen.getTangentAt(offset).angle);
  }
}
