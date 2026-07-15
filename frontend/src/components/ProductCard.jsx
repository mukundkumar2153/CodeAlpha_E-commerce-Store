import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const percentOff = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product._id, 1);
  };

  return (
    <Link to={`/product/${product.slug}`} className="product-card">
      <div className="product-card-img-wrap">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/400"}
          alt={product.name}
          className="product-card-img"
        />
        {hasDiscount && (
          <span className="badge-discount">
            <span className="stamp-percent">{percentOff}%</span>
            <span className="stamp-label">off</span>
          </span>
        )}
        {outOfStock && <span className="badge-outofstock">Sold Out</span>}
        {!outOfStock && lowStock && <span className="badge-lowstock">Only {product.stock} left</span>}

        {!outOfStock && (
          <button className="quick-add-btn" onClick={handleQuickAdd} title="Add to cart">
            + Cart
          </button>
        )}
      </div>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        {product.numReviews > 0 && (
          <span className="product-card-rating">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
            <span className="rating-count">({product.numReviews})</span>
          </span>
        )}
        <div className="price-tag">
          <span className="current">₹{(hasDiscount ? product.discountPrice : product.price).toLocaleString()}</span>
          {hasDiscount && <span className="original">₹{product.price.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;