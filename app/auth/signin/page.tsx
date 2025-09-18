import SignInForm from "../../../components/auth/SignInForm";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ברוכים השבים</h1>
          <p className="text-gray-600 mt-2">התחבר לחשבון שלך כדי להמשיך</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
};

export default SignInPage;
