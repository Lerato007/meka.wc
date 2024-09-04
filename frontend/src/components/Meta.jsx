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
  description: "Lifestyle streetwear brand.",
  keywords: "clothes, fashion, T-Shirts",
};

export default Meta;
