import SignUpForm from "../../../components/auth/SignUpForm";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">יצירת חשבון</h1>
          <p className="text-gray-600 mt-2">הירשם כדי להתחיל עם החשבון שלך</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
