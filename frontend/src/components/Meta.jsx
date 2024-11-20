import { Helmet } from "react-helmet-async";

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keyword" content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: "MEKA.WC",
  description: "Meka.WC online store. Where simplicity meets quality. Shop the latest fashion trends.",
  keywords: "clothes, fashion, T-Shirts, Tees",
};

export default Meta;
