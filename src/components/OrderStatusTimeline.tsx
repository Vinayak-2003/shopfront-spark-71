import { OrderStatus } from "@/types/order";
import { 
  Package, 
  CheckCircle, 
  Truck, 
  MapPin, 
  CheckCheck,
  Clock,
  XCircle
} from "lucide-react";

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

// Status order for timeline visualization
const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

// Status labels
const STATUS_LABELS: Record<OrderStatus, string> = {
  "PENDING": "Order Placed",
  "CONFIRMED": "Confirmed",
  "PACKED": "Packed",
  "OUT_FOR_DELIVERY": "Out for Delivery",
  "DELIVERED": "Delivered",
  "CANCELLED": "Cancelled",
  "RETURN_REQUESTED": "Return Requested",
  "RETURNED": "Returned",
  "DELAY": "Delayed"
};

// Status icons
const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  "PENDING": <Package className="h-5 w-5" />,
  "CONFIRMED": <CheckCircle className="h-5 w-5" />,
  "PACKED": <Package className="h-5 w-5" />,
  "OUT_FOR_DELIVERY": <Truck className="h-5 w-5" />,
  "DELIVERED": <CheckCheck className="h-5 w-5" />,
  "CANCELLED": <XCircle className="h-5 w-5" />,
  "RETURN_REQUESTED": <Truck className="h-5 w-5" />,
  "RETURNED": <XCircle className="h-5 w-5" />,
  "DELAY": <Clock className="h-5 w-5" />
};

// Status descriptions
const STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  "PENDING": "We've received your order and are processing it",
  "CONFIRMED": "Your order has been confirmed and is being prepared",
  "PACKED": "Your order has been packed and is ready for shipment",
  "OUT_FOR_DELIVERY": "Your order is out for delivery",
  "DELIVERED": "Your order has been delivered successfully",
  "CANCELLED": "Your order has been cancelled",
  "RETURN_REQUESTED": "Return request has been initiated",
  "RETURNED": "Your order has been returned",
  "DELAY": "There might be a delay in delivery"
};

export default function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  // For non-linear statuses, show a simplified view
  const isNonLinearStatus = ["CANCELLED", "RETURN_REQUESTED", "RETURNED", "DELAY"].includes(currentStatus);
  
  if (isNonLinearStatus) {
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex-shrink-0">
          {STATUS_ICONS[currentStatus]}
        </div>
        <div>
          <p className="font-medium">{STATUS_LABELS[currentStatus]}</p>
          <p className="text-sm text-muted-foreground">{STATUS_DESCRIPTIONS[currentStatus]}</p>
        </div>
      </div>
    );
  }

  // For linear statuses, show the full timeline
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Order Progress</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted ml-2"></div>
        
        <div className="space-y-6">
          {STATUS_ORDER.map((status, index) => {
            const isCompleted = STATUS_ORDER.indexOf(currentStatus) >= index;
            const isCurrent = currentStatus === status;
            
            return (
              <div key={status} className="relative flex items-start gap-4">
                {/* Status indicator */}
                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full z-10 ${
                  isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted border-2 border-muted"
                }`}>
                  {STATUS_ICONS[status]}
                </div>
                
                {/* Status content */}
                <div className="pb-2">
                  <p className={`font-medium ${isCurrent ? "text-primary" : ""}`}>
                    {STATUS_LABELS[status]}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {STATUS_DESCRIPTIONS[status]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}