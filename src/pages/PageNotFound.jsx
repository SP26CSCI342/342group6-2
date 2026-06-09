import OutOfOrder from '../components/GamePlay/sprites/OutOfOrder.png';

function PageNotFound() {
    return (
        <div>
            <div>SORRY! The page you&apos;re looking for does not exist</div>
            <img src={OutOfOrder} alt="404 not found" />
        </div>
    );
}
export default PageNotFound;